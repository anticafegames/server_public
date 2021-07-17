import socket_io = require('socket.io')

import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../common/array'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../abstract-socket-helper'
import { iRoom, iResponceRoom, iUser, iResponceUser, iJoinRoomParams, iRegRoomParams, iRoomJoinMode } from '../../../entity/room/interface'
import { iVkSession } from '../../../interfaces/passport'
import { iEntityMode } from '../../../interfaces/common'
import { cloneRoom, cloneShortRoom } from '../../../entity/room/converter'
import Logger from '../../logger'
import Room from '../../../entity/room'
import RoomOwnerSocket from '../../../sockets/room/room-owner-socket'
import user from '../../../models/User/user'
import { verifyKnockToken } from '../../passport/knock-tocken'

export default class RoomOwnerHelper extends AbstractHelper<RoomOwnerSocket> {

    server: MainSocketServer
    mainSocket: MainSocket

    get room() {
        return this.socket.room
    }

    changeOwner = (userId: string) => {
        if(this.room) {console.log('changeOwner help')
            this.room.changeOwner(userId, this.mainSocket)
        }
    }

    kickUser = (userId: string) => {

        if(this.isOwner) {
            const user = this.room.findUserById(userId)
            const socket = user.socket as MainSocket
            socket.roomSocket.leaveEvent()
            socket.emit('room_kick_from_room', {})
        }
    }

    knockOnRoom = (candidate: MainSocket, knockToken: string) => {
        this.socket.emit('room_owner_knock_on_room', { user: candidate.userHelper.userResponce, knockToken })
    }

    knockOnRoomResponceSuccess = async (userId: string, knockToken: string) => {

        const canRoomJoin = await this.canRoomJoinAfterKnock(userId, knockToken)
        if(!canRoomJoin) return

        const user = this.server.getSocketById(userId) as MainSocket
        user.roomSocket.roomHelper.knockOnRoomSuccess(this.room)
    }

    canRoomJoinAfterKnock = async (userId: string, knockToken: string) => {

        const userSocket = this.server.getSocketById(userId) as MainSocket

        if(!userSocket) {
            this.socket.log('Пользователь вышел', 'canRoomJoinAfterKnock', userId)
            return false
        }

        if(!knockToken) {
            this.socket.log('Нет knock токена', 'canRoomJoinAfterKnock', userId)
            return false
        }

        const { error, data } = await verifyKnockToken(knockToken)

        if(!data) {
            this.socket.log('Нет knock токена', 'canRoomJoinAfterKnock', userId)
            return false
        }

        if(data.id !== userId) {
            this.socket.log('UserId запроса не совпадает с userId токена', 'canRoomJoinAfterKnock', userId)
            return false
        }

        if(!this.room) {
            this.socket.log('Комнаты владельца уже нет', 'canRoomJoinAfterKnock')
            return false
        }

        if(this.room.id !== data.roomId) {
            this.socket.log('Токен не в ту комнату', 'canRoomJoinAfterKnock')
            return false
        }

        return true
    }

    get isOwner() {
        return this.mainSocket.id === this.room.ownerId
    }
}