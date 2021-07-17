import { v1 as uuidv1 } from 'uuid'

import DefaultSocket from '../../code/socket/abstract-socket'

import { iSocketResultWebRtcData } from '../../interfaces/webrtc'
import { iRoom, iUser, iRegRoomParams, iJoinRoomParams, iRoomJoinMode } from '../../entity/room/interface'
import Logger from '../../code/logger'
import MainSocket from '../main-socket'
import RoomHelper from '../../code/socket-helpers/room/room-helper'
import Room from '../../entity/room'
import RoomOwnerSocket from './room-owner-socket'
import MainSocketServer from '../main-socket-server'

export default class RoomSocket extends DefaultSocket {

    server: MainSocketServer
    mainSocket: MainSocket
    roomOwnerSocket: RoomOwnerSocket

    roomHelper: RoomHelper

    room: Room

    bindEvents = () => {
        this.on('rooms', this.getRoomsEvent)
        this.on('room_join', this.roomJoinEvent)
        this.on('reconnet_room', this.reconnectRoomEvent)
        this.on('room_info', this.roomInfo)
        this.on('room_knock_on_room', this.knockOnRoom)
        this.on('leave', this.leaveEvent)
        this.on('ping', this.pong)
        this.on('pong', this.pong)

        this.roomOwnerSocket = new RoomOwnerSocket(this)
        this.roomOwnerSocket.initHelpers()
        this.roomOwnerSocket.bindEvents()
    }

    initHelpers = () => {
        this.roomHelper = new RoomHelper(this)
    }

    unbindEvents = () => {
        this.leaveEvent()
        this.offAllEvents()
    }

    getRoomsEvent = () => {
        Logger.info('rooms', 'main socket getRoomsEvent', { user: this.mainSocket.id })
        this.emit('rooms', { rooms: this.roomHelper.getAllRoomsForResponce('responce-short', this.roomHelper.filterRoomsForSearch) })
    }

    roomJoinEvent = async (data) => {

        const token: string = data.token
        const params: iRegRoomParams | iJoinRoomParams = data.params
        const mode: iRoomJoinMode = data.mode

        if (await this.mainSocket.authHelper.checkToken(token, 'room_connect')) {

            const { error, result: room } = this.roomHelper.roomJoin(params, mode)

            if (error) {
                this.errorEmit('room_connect', error)
                return
            }

            if (mode === 'join') {
                this.roomJoinBroadcastEmitRoom()
            }

            this.roomConnectEmit()
            this.log('Room Join', `RoomId: ${this.room.id}`, `UserId: ${this.socket.id}`)

        } else {
            this.errorEmit('room_connect', 'Неудалось подключиться к комнате')
        }
    }

    reconnectRoomEvent = async (data) => {

        const token: string = data.token
        const roomToken: string = data.roomToken

        const reconnect = await this.mainSocket.authHelper.checkReconnectRoom(token, roomToken)

        if (reconnect) {

            let args = {  }

            if (this.room.status === 'game') {

                const { error, result: game } = this.mainSocket.gameCommonSocket.gameCommonHelper.reconnectGame()

                if(error) {
                    return this.errorEmit('room_connect', error, { mode: 'reconnect' })
                }

                args = { game }
            }

            this.roomConnectEmit('reconnect', args)
            this.roomJoinBroadcastEmitRoom()

        } else {
            this.errorEmit('room_connect', 'Неудалось подключиться к комнате', { mode: 'reconnect' })
        }
    }

    knockOnRoom = async (data) => {

        const token: string = data.token
        const roomId: string = data.roomId

        const reconnect = await this.mainSocket.authHelper.checkToken(token)

        if (reconnect) {

            const { error } = this.roomHelper.knockOnRoom(roomId)

            if (error) {
                this.errorEmit('room_knock_on_room', error)
            }

        } else {
            this.errorEmit('room_knock_on_room', 'Неудалось подключиться к комнате')
        }
    }

    leaveEvent = () => {

        Logger.info('leave', 'main socket leaveEvent', { user: this.mainSocket.id })

        if (this.room) {
            this.broadcastRoom('leave', { userId: this.mainSocket.id, removeRoomPeer: this.room.status !== 'game' })

            this.roomHelper.leaveFromRoom()
        }
    }

    roomInfo = ({ roomId }: any) => {
        const room = this.roomHelper.findRoomById(roomId)

        if (!room) {
            this.errorEmit('room_info', 'Комнаты нет')
        } else {
            this.emit('room_info', { result: { room: room.cloneShortRoom() } })
        }
    }

    pong = (data) => {
       console.log('poooongggg', data) 
    }

    roomConnectEmit = (mode: 'connect' | 'reconnect' | 'knock' = 'connect', args: any = {}) => this.emit('room_connect', { result: { room: this.roomHelper.getRoomForResponce('responce'), roomToken: this.mainSocket.authHelper.getRoomToken(), ...args }, mode })
    roomJoinBroadcastEmitRoom = () => this.broadcastRoom('room_join', { userId: this.mainSocket.id, vkId: this.mainSocket.vkId })
}