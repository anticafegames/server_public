import socket_io = require('socket.io')
import { v1 as uuidv1 } from 'uuid'

import MainSocket from '../../../sockets/main-socket'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../abstract-socket-helper'
import { iVkSession, iVkAuth } from '../../../interfaces/passport'
import { verifySession, verifyAuthToken } from '../../passport/vk-pasport-helper'
import { authErrors } from '../../errors'
import { getRoomToken, verifyRoomToken } from '../../passport/room-token'
import { iRoomToken } from '../../../entity/room/interface'
import Logger from '../../logger'
import { adminsVkId } from '../../../configs/admin-config'
import { verifyToken } from '../../../init-passport'
import { disconnect } from 'cluster'
import DebugSocket from '../../../sockets/debug/debug-socket'
import { iSiteInfo } from '../../../interfaces/admin'

export default class DebugHelper extends AbstractHelper<DebugSocket> {

    server: MainSocketServer

    getSiteInfo = () => {

        const rooms = this.getAllRooms()
        const users = this.getAllUsers()

        const info: iSiteInfo = { rooms, users }

        return info
    }

    getAllUsers = () => {
        return this.server.users.map(user => (user.mainSocket as MainSocket).userHelper.userResponce)
    }

    getAllRooms = () => {
        return this.server.rooms.map(room => room.cloneRoom())
    }
}