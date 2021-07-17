import DefaultMainSocket from '../code/socket/abstract-main-socket'

import RoomSocket from './room/room-socket'
import WebrtcSocket from './webrtc/webrtc-socket'
import AdminSocket from './debug/debug-socket'
import { verifySession } from '../code/passport/vk-pasport-helper'
import { authErrors } from '../code/errors'
import { iVkSession, iVkAuth } from '../interfaces/passport'
import { iRoom, iRoomJoinMode, iRegRoomParams, iJoinRoomParams } from '../entity/room/interface'
import MainSocketServer from './main-socket-server'
import { deleteArrayItem } from '../code/common/array'

import RoomHelper from '../code/socket-helpers/room/room-helper'
import AuthHelper from '../code/socket-helpers/auth/auth-helper'
import UserHelper from '../code/socket-helpers/user/user-helper'
import Logger from '../code/logger'
import Room from '../entity/room'
import GameCommonSocket from './game/game-common-socket'

export default class MainSocket extends DefaultMainSocket {

    server: MainSocketServer

    vkId: number
    vkAuth: iVkAuth

    get room() {
        return this.roomSocket.room
    }

    set room(room: Room) {
        this.roomSocket.room = room
    }

    get user() {
        return this.userHelper.user
    }

    roomSocket: RoomSocket
    webrtcSocket: WebrtcSocket
    adminSocket: AdminSocket
    gameCommonSocket: GameCommonSocket

    authHelper: AuthHelper
    userHelper: UserHelper

    bindEvents = () => {
        
        this.roomSocket = new RoomSocket(this.server, this.socket, this)
        this.roomSocket.initHelpers()
        this.roomSocket.bindEvents()

        this.webrtcSocket = new WebrtcSocket(this.server, this.socket, this)
        this.webrtcSocket.initHelpers()
        this.webrtcSocket.bindEvents()

        this.adminSocket = new AdminSocket(this.server, this.socket, this)
        this.adminSocket.initHelpers()
        this.adminSocket.bindEvents()

        this.gameCommonSocket = new GameCommonSocket(this)
        this.gameCommonSocket.bindEvents()
        this.gameCommonSocket.initHelpers()
    }

    unbindEvents = () => {
        this.roomSocket.unbindEvents()
        this.webrtcSocket.unbindEvents()
        this.gameCommonSocket.unbindEvents()
    }

    initHelpers = () => {
        this.authHelper = new AuthHelper(this)
        this.userHelper = new UserHelper(this)
    }
}