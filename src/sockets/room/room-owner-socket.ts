import { v1 as uuidv1 } from 'uuid'
import socket_io = require('socket.io')

import DefaultSocket from '../../code/socket/abstract-socket'

import { iSocketResultWebRtcData } from '../../interfaces/webrtc'
import { iRoom, iUser, iRegRoomParams, iJoinRoomParams, iRoomJoinMode } from '../../entity/room/interface'
import Logger from '../../code/logger'
import MainSocket from '../main-socket'
import RoomHelper from '../../code/socket-helpers/room/room-helper'
import RoomOwnerHelper from '../../code/socket-helpers/room/room-owner-helper'
import Room from '../../entity/room'
import RoomSocket from './room-socket'
import AbstractSocketServer from '../../code/socket/abstract-socket-server'
import AbstractMainSocket from '../../code/socket/abstract-main-socket'

export default class RoomOwnerSocket extends DefaultSocket {

    mainSocket: MainSocket
    roomSocket: RoomSocket

    roomHelper: RoomHelper
    roomOwnerHelper: RoomOwnerHelper

    get room() {
        return this.roomSocket.room
    }

    constructor(roomSocket: RoomSocket) {
        super(roomSocket.server, roomSocket.socket, roomSocket.mainSocket)

        this.roomSocket = roomSocket
        this.roomHelper = roomSocket.roomHelper
    }

    bindEvents = () => {
        this.on('room_change_owner', this.changeOwnerEvent)
        this.on('room_kick_user', this.kickUserEvent)
        this.on('room_owner_knock_on_room', this.knockResponce)
    }

    initHelpers = () => {
        this.roomOwnerHelper = new RoomOwnerHelper(this)
    }

    changeOwnerEvent = ({ userId }: any) => {
        this.roomOwnerHelper.changeOwner(userId)
    }

    kickUserEvent = ({ userId }: any) => {
        this.roomOwnerHelper.kickUser(userId)
    }

    knockResponce = async ({ userId, knockToken }: any) => {
        await this.roomOwnerHelper.knockOnRoomResponceSuccess(userId, knockToken)
    }
}