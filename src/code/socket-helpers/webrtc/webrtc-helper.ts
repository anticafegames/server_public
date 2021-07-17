import socket_io = require('socket.io')
import { v1 as uuidv1 } from 'uuid'
const Kurento = require('kurento-client')

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

export default class WebRTCHelper extends AbstractHelper<WebRTCSocket> {

    server: MainSocketServer
    mainSocket: MainSocket

    get kurentoHelper() {
        return this.socket.kurentoHelper
    }

    kurentoWebrtcEvent = (data: iSocketResultWebRtcData) => {

        switch (data.type) {

            case 'presenter':
                this.kurentoNewPresenter(data)
                break

            case 'viewer':
                this.kurentoNewViewer(data)
                break

            case 'stop':
                this.kurentoHelper.stopPresenter()
                break

            case 'iceCandidate':
                this.kurentoHelper.onIceCandidate(data)
                break

            case 'reconnect':
                this.kurentoHelper.reconnect('viewing', data)
                break

        }
    }

    kurentoNewPresenter = async (data: iSocketResultWebRtcData) => {

        const result = await this.kurentoHelper.startPresenter(data)

        if(!result.error) {

            this.mainSocket.room.users.forEach(user => {

                if(user.id !== this.mainSocket.id && !user.disconnected) {
                    user.socket.emit('webrtc', { type: 'create_offer', userId: this.socket.userId })
                    this.socket.emit('webrtc', { type: 'create_offer', userId: user.id })
                }
            })
        }
    }

    kurentoNewViewer = async (data: iSocketResultWebRtcData) => {

        const result = await this.kurentoHelper.startViewer(data)
        this.socket.emit('webrtc', result)

    }

    canEmitWebrtcEvent = (data: iSocketResultWebRtcData): iResult<boolean> => {

        if (data.peerId === undefined) {
            return { error: 'Нет id приемника' }
        }

        const recipient = this.socket.getSocketById(data.peerId) as MainSocket

        if (!recipient) {
            return { error: 'Нет найден приемник' }
        }

        if (!this.mainSocket.room) {
            return { error: 'У отправителя нет комнаты' }
        }

        if (!recipient.room) {
            return { error: 'У приемника нет комнаты' }
        }

        if (recipient.room.id !== this.mainSocket.room.id) {
            return { error: 'Отправитель и приемника находятся в разных комнатах' }
        }

        return { result: true }
    }
}