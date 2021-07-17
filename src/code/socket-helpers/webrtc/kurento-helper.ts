import socket_io = require('socket.io')
import { v1 as uuidv1 } from 'uuid'
import * as Kurento from 'kurento-client'

import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../common/array'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../abstract-socket-helper'
import { iRoom, iResponceRoom, iUser, iResponceUser, iJoinRoomParams, iRegRoomParams, iRoomJoinMode } from '../../../entity/room/interface'
import { iVkSession, iVkAuth } from '../../../interfaces/passport'
import { iEntityMode, iResult } from '../../../interfaces/common'
import { cloneRoom, cloneShortRoom } from '../../../entity/room/converter'
import Room from '../../../entity/room'
import WebRTCSocket from '../../../sockets/webrtc/webrtc-socket'
import { kurentoUrl } from '../../../configs/webrtc-config'
import { iSocketResultWebRtcData } from '../../../interfaces/webrtc'
import { off } from 'process'
import Presenter from '../../../entity/webrtc/presenter'
import Viewer from '../../../entity/webrtc/viewer'

export default class KurentoHelper extends AbstractHelper<WebRTCSocket> {

    server: MainSocketServer
    mainSocket: MainSocket

    presenter: Presenter

    //Тот, кто смотрит
    viewers: Viewer[] = []

    //Тот, кого смотрим
    viewing: Viewer[] = []

    candidatesQueue: any[] = []

    static kurentoClient: Kurento.ClientInstance

    get kurentoClient() {
        return KurentoHelper.kurentoClient
    }

    set kurentoClient(value) {
        KurentoHelper.kurentoClient = value
    }

    constructor(socket: WebRTCSocket) {
        super(socket)
        this.createKurentoClient()
    }

    createKurentoClient = () => {

        const promise = new Promise(async (resolve) => {

            if (this.kurentoClient) {
                return resolve(this.kurentoClient)
            }

            try {

                const _kurentoClient = await Kurento(kurentoUrl, {
                    failAfter: 10,
                    request_timeout: 10000,
                    response_timeout: 10000,
                    duplicates_timeout: 10000
                })

                this.kurentoClient = _kurentoClient
                resolve(this.kurentoClient)

            } catch (error) {

                this.socket.clientToastError("Не удаётся подключиться к медиасерверу. Пожалуйста, попробуйте перезагрузить страницу.")
                this.socket.error(error)
            }
        })

        return promise
    }

    startPresenter = (data: iSocketResultWebRtcData): Promise<any> => {

        const { desc: offer } = data
        const userId = 'presenter'

        this.candidatesQueue = []

        const promise = new Promise(async resolve => {

            try {

                const canStart = this.canStartPresenter()

                if (canStart.error) {
                    throw new Error(canStart.error)
                }

                this.presenter = new Presenter(this)
                resolve(await this.presenter.startPresenter(offer))

            } catch (error) {
                resolve({ type: 'answer', userId, error })
            }

        })

        return promise
    }

    //На чуваке, которым смотреть, а addViewer - на чуваке кого смотреть
    startViewer = async (data: iSocketResultWebRtcData): Promise<iResult<any>> => {

        const { desc: offer, userId: peerId } = data

        this.candidatesQueue = []

        const promise = new Promise(async resolve => {

            const errorMessage = (message: string) => resolve({ type: 'answer', userId: peerId, error: message })

            const canStart = this.canStartViewer(peerId)

            if (canStart.error) {
                return errorMessage(canStart.error)
            }

            const peer = this.mainSocket.room.findUserById(peerId)
            const viewer = new Viewer(peer.socket, this.mainSocket)

            resolve(await viewer.startViewer(offer))
        })

        return promise
    }

    onIceCandidate = ({ userId, desc }: iSocketResultWebRtcData) => {

        const candidate = Kurento.getComplexType('IceCandidate')(desc)

        if (userId === 'presenter') {

            if (this.presenter) {

                if (this.presenter.answerIsSent && this.presenter.webRtcEndpoint) {
                    this.presenter.webRtcEndpoint.addIceCandidate(candidate)
                } else {
                    this.presenter.candidatesQueueToServer.push(candidate)
                }
            }
            else {
                this.socket.error('Не нашли presenter, возможно нужно чтото мутить с candidatesQueue, как в примере', 'onIceCandidate')
            }

        } else {
            
            const viewing = this.viewing.find(view => view.presenterSocket.id === userId)

            if (viewing) {

                if (viewing.answerIsSent && viewing.webRtcEndpoint) {
                    viewing.webRtcEndpoint.addIceCandidate(candidate)
                } else {
                    viewing.candidatesQueueToServer.push(candidate)
                }
            }
            else {
                this.socket.error('Не нашли viewing, возможно нужно чтото мутить с candidatesQueue, как в примере', 'onIceCandidate')
            }

        }
    }

    //Тут короче сложно, если мы вызываем из сокета, то ищем viewing (Ошибка пришла с нашего клиента), если из ивента (Ошибка пришла из Kurento), то ищем от viewer 
    reconnect = (mode: 'presenter' | 'viewer' | 'viewing', data: iSocketResultWebRtcData) => {

        switch (mode) {

            case 'presenter':

                if(this.presenter) {
                    this.presenter.stopPresenter()
                }

                break

            case 'viewer':

                const viewer = data.desc as Viewer

                viewer.stopViewer()

                break

            case 'viewing':
                
                const viewing = this.viewing.find(v => v.presenterSocket.id === data.userId)

                if (viewing) {
                    viewing.stopViewer()
                }
 
                break

        }

        this.socket.emit('webrtc', { type: 'reconnect', userId: data.userId })
    }

    stopPresenter = () => {
        if(this.presenter) {
            this.presenter.stopPresenter()
        }
    }

    answerWrapper = (sdp: any) => ({ sdp, type: 'answer' })

    canStartPresenter = (): iResult<boolean> => {

        if (this.presenter) {
            return { error: 'Presenter уже создан' }
        }

        if (!this.mainSocket.room) {
            return { error: 'Пользователь не в комнате' }
        }

        return { result: true }
    }

    canStartViewer = (peerId: string): iResult<boolean> => {

        const room = this.mainSocket.room

        if (!room) {
            return { error: 'Польователь не в комнате' }
        }

        const peer = room.findUserById(peerId)

        if (!peer) {
            return { error: 'Пира нет в комнате' }
        }

        if (this.viewing.some(view => view.presenterSocket.id === peerId && !view.presenterSocket.user.disconnected)) {
            return { error: 'Пользователь уже просматривает пира' }
        }

        const presenter = peer.socket.webrtcSocket.kurentoHelper.presenter

        if (presenter == null) {
            return { error: 'У пира не создан Presenter' }
        }

        return { result: true }
    }
}