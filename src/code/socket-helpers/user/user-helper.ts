import socket_io = require('socket.io')
import { v1 as uuidv1 } from 'uuid'

import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../common/array'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../abstract-socket-helper'
import { iRoom, iResponceRoom, iUser, iResponceUser, iJoinRoomParams, iRegRoomParams, iRoomJoinMode } from '../../../entity/room/interface'
import { iVkSession, iVkAuth } from '../../../interfaces/passport'
import { iEntityMode } from '../../../interfaces/common'
import { cloneRoom, cloneShortRoom } from '../../../entity/room/converter'
import Room from '../../../entity/room'

export default class UserHelper extends AbstractHelper<MainSocket> {

    server: MainSocketServer

    fillUserData = (vkAuth?: iVkAuth, room?: Room, id?: string) => {

        if (vkAuth) {
            this.socket.vkAuth = vkAuth
            this.socket.vkId = vkAuth.user_id
        }
        
        if (id) {

            this.replaceUserId(id)

            this.socket.emit('userId', { userId: id })
            this.socket.log('Fill User Data', 'Заменили id', id)
        }
        
        if (room) {
            this.socket.roomSocket.roomHelper.pushUserToRoom(room)

            const roomUser = room.findUserById(id)
            if(roomUser) {
                roomUser.socket = this.socket
                roomUser.disconnected = false
            }

            this.socket.log('Fill User Data', 'Заполнили room', room.cloneRoom())
        }
    }

    replaceUserId = (newUserId: string) => {

        const oldUserId = this.socket.id
        this.socket.id = newUserId

        if (this.socket.room) {
            deleteArrayItem(this.socket.room.users, user => user.id === oldUserId)
            this.socket.room.users.push(this.user)
        }
    }

    get user() {
        return <iUser>{ id: this.socket.id, vkId: this.socket.vkId, socket: this.socket }
    }

    get userResponce() {
        return <iResponceUser>{ id: this.socket.id, vkId: this.socket.vkId }
    }
}