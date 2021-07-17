import socket_io = require('socket.io')
import { v1 as uuidv1 } from 'uuid'

import MainSocket from '../../../sockets/main-socket'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../abstract-socket-helper'
import { iVkSession, iVkAuth } from '../../../interfaces/passport'
import { verifySession, verifyAuthToken, isDeveloper, isAdmin } from '../../passport/vk-pasport-helper'
import { authErrors } from '../../errors'
import { getRoomToken, verifyRoomToken } from '../../passport/room-token'
import { iRoomToken } from '../../../entity/room/interface'
import Logger from '../../logger'
import { adminsVkId } from '../../../configs/admin-config'
import { verifyToken } from '../../../init-passport'
import { disconnect } from 'cluster'

export default class AuthHelper extends AbstractHelper<MainSocket> {

    server: MainSocketServer

    checkToken = async (token: string, event?: string) => {

        if (!token) {
            return false
        }
        
        const resultAithToken = await verifyAuthToken(token)

        if (resultAithToken.error) {

            this.socket.log('room_join_main_Error', authErrors[1])

            if (event) {
                this.socket.emit(event, { error: authErrors[1] })
            }

            return false
        }

        const vkAuth: iVkAuth = resultAithToken.data
        this.socket.userHelper.fillUserData(vkAuth)

        return vkAuth
    }

    checkAdmin = () => {

        const vkAuth = this.socket.vkAuth

        if (vkAuth && isAdmin(vkAuth.user_id)) {
            return true
        }

        Logger.warning(`Поппытка выдать себя заадмина`, 'checkAdmin', vkAuth)
        return false
    }

    checkDeveloper = () => {

        const vkAuth = this.socket.vkAuth

        if (vkAuth && isDeveloper(vkAuth.user_id)) {
            return true
        }

        this.socket.warning(`Поппытка выдвть себя за разработчика`, 'checkDeveloper', vkAuth)
        return false
    }

    checkReconnectRoom = async (token: string, roomToken: string) => {

        const vkAuth = await this.checkToken(token)

        if (!vkAuth) {
            this.socket.log('Reconnect Room', 'Поддельная сессия')
            return false
        }

        const decodeToken: iRoomToken = await this.verifyRoomToken(roomToken)

        if (!decodeToken) {
            return false
        }

        //У вк приложений всегда меняются вк токены
        if (vkAuth.appKey === 'web' && decodeToken.vkAuth.appKey === 'web' && vkAuth.access_token !== decodeToken.vkAuth.access_token) {
            this.socket.log('Reconnect Room', 'access tokens сессии и токена не совпадают')
            return false
        }

        if (vkAuth.user_id !== decodeToken.vkAuth.user_id) {
            this.socket.log('Reconnect Room', 'Юзеры сессии и токена не совпадают')
            return false
        }

        const room = this.socket.roomSocket.roomHelper.findRoomById(decodeToken.roomId)

        if (!room) {
            this.socket.log('Reconnect Room', 'Не нашли комнату')
            return false
        }

        if (room.findUserById(decodeToken.id)) {
            if (room.debugRoomParams.debugMode) {
                const disconnectUser = room.findUser(user => user.disconnected)
                decodeToken.id = disconnectUser ? disconnectUser.id : decodeToken.id + room.users.length
            } else {
                this.socket.log('Reconnect Room', 'Пользователь с данным id уже в комнате')
                return false
            }
        }

        this.socket.userHelper.fillUserData(vkAuth, room, decodeToken.id)
        return true
    }

    getRoomToken = () => getRoomToken(this.socket.id, this.socket.vkAuth, this.socket.room.id)
    verifyRoomToken = async (token: string) => {

        const result = await verifyRoomToken(token)

        const error = result.error
        const data: iRoomToken = result.data

        if (error) {
            this.socket.log('Verify room token error', error)
            return null
        }

        return data
    }
}