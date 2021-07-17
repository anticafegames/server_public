import socket_io = require('socket.io')
import md5 = require('md5')

import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../common/array'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../abstract-socket-helper'
import { iRoom, iResponceRoom, iUser, iResponceUser, iJoinRoomParams, iRegRoomParams, iRoomJoinMode } from '../../../entity/room/interface'
import { iVkSession } from '../../../interfaces/passport'
import { iEntityMode, iResult } from '../../../interfaces/common'
import { cloneRoom, cloneShortRoom } from '../../../entity/room/converter'
import Logger from '../../logger'
import Room from '../../../entity/room'
import RoomSocket from '../../../sockets/room/room-socket'
import { getKnockToken } from '../../passport/knock-tocken'

export default class RoomHelper extends AbstractHelper<RoomSocket> {

    systemRooms = ['search-room']
    server: MainSocketServer
    mainSocket: MainSocket

    get room() {
        return this.socket.room
    }

    roomJoin = (params: iJoinRoomParams | iRegRoomParams, mode: iRoomJoinMode) => {

        let result: iResult<Room>

        switch (mode) {

            case 'create':
                result = this.createRoom(params as iRegRoomParams)
                break

            case 'join':
                result = this.addUserToRoom(params as iJoinRoomParams)
                break

        }

        if (result.result) {
            this.socket.room = result.result
        }

        return result
    }

    addUserToRoom = (joinParams: iJoinRoomParams): iResult<Room> => {

        const { error } = this.checkJoinRoomParams(joinParams)
        if (error) return { error }

        const room = this.findRoomById(joinParams.roomId)

        if (!room) {
            this.socket.errorEmit('room_connect', 'Комната не найдена')
            return null
        }

        this.pushUserToRoom(room)

        Logger.info('addUserToRoom', 'room helper', { room: this.getRoomForResponce('responce-short', room), user: this.mainSocket.id })

        return { result: room }
    }

    createRoom = (regParams: iRegRoomParams): iResult<Room> => {

        const { error } = this.checkRegRoomParams(regParams)
        if (error) return { error }

        const room = new Room(regParams, [], this.mainSocket.userHelper.user, this.server)
        this.server.rooms.push(room)

        this.pushUserToRoom(room)
        this.getRoomsBroadcastEvent()

        Logger.info('create room', 'room helper', { room: this.getRoomForResponce('responce-short', room), user: this.mainSocket.id })

        return { result: room }
    }

    knockOnRoomSuccess = (room: Room) => {

        this.pushUserToRoom(room)
        this.socket.roomConnectEmit('knock')
        this.socket.roomJoinBroadcastEmitRoom()
        this.socket.roomHelper.getRoomsBroadcastEvent()

        Logger.info('knockOnRoomSuccess', 'room helper', { room: this.getRoomForResponce('responce-short', room), user: this.mainSocket.id })
    }

    getRoomsBroadcastEvent = () => {
        this.socketIO.broadcast.to('search-room').emit('rooms', { rooms: this.getAllRoomsForResponce('responce-short', this.filterRoomsForSearch) })
    }

    get allRooms() { return this.server.rooms }

    getRoomForResponce = (mode: iEntityMode, room = this.socket.room) => {

        switch (mode) {

            case 'responce':
                return room.cloneRoom([this.mainSocket.id])

            case 'responce-short':
                return room.cloneShortRoom()

            default:
                throw new Error('Недоступный EntityMode')

        }
    }

    getAllRoomsForResponce = (mode: iEntityMode, filter?: (room: Room) => boolean) => {
        
        const rooms = filter ? this.allRooms.filter(filter) : this.allRooms 

        switch (mode) {

            case 'responce':
                return rooms.map(room => room.cloneRoom())

            case 'responce-short':
                return rooms.map(room => room.cloneShortRoom())

            default:
                throw new Error('Недоступный EntityMode')

        }
    }

    leaveFromRoom = () => {

        if (this.room) {
            this.room.disconnectUser(this.mainSocket)
        }

        this.mainSocket.webrtcSocket.stopConnectionEvent()
        this.leaveSocketIORoom(false)
    }

    pushUserToRoom = (room: Room) => {

        if (!room) return

        this.leaveFromRoom()
        this.socketIO.join(room.id || 'search-room')

        this.socket.room = room
        room.addUser(this.mainSocket.userHelper.user)
    }

    knockOnRoom = (roomId: string): iResult<true> => {

        const { error } = this.checkKnockOnRoom(roomId)
        if (error) return { error }

        const owner = this.findRoomById(roomId).owner.socket as MainSocket
        const knockToken = getKnockToken(this.mainSocket.id, roomId)

        owner.roomSocket.roomOwnerSocket.roomOwnerHelper.knockOnRoom(this.mainSocket, knockToken)
    }

    checkRegRoomParams = (params: iRegRoomParams): iResult<boolean> => {

        if (!params.openRoom && !params.password) {
            this.socket.log('Закрытая комната без пароля', 'canCreateRoom', params)
            return { error: 'Закрытая комната без пароля' }
        }

        return { result: true }
    }

    checkJoinRoomParams = (params: iJoinRoomParams): iResult<boolean> => {

        if (!params.roomId) {
            this.socket.log('Нет roomId', 'canJoinRoom', params)
            return { error: 'Нет roomId' }
        }

        const room = this.findRoomById(params.roomId)

        if (!room) {
            this.socket.log('Нет комнаты', 'canJoinRoom', params, this.server.rooms.map(room => room.id))
            return { error: 'Нет комнаты' }
        }

        if(room.status === 'game') {
            this.socket.log('Комната в игре', 'canJoinRoom', params, this.server.rooms.map(room => room.id))
            return { error: 'Комната в игре' }
        }

        if(room.maxUsers === room.users.length) {
            this.socket.log('В комнате максимальное количество игроков', 'canJoinRoom', params, this.server.rooms.map(room => room.id))
            return { error: 'В комнате максимальное количество игроков' }
        }

        if (!room.openRoom) {

            if (!params.password) {
                this.socket.log('Нет пароля', 'canJoinRoom', params)
                return { error: 'Нет пароля' }
            }

            const password = md5(params.password)

            if (room.password !== password) {
                this.socket.log('Неверный пароль', 'canJoinRoom', params, { roomPasswort: room.password, md5: password })
                return { error: 'Неверный пароль' }
            }
        }

        /* пока не прод, чтобы тестить
         if(!room.isDebug && room.findUser(user => user.vkId === this.mainSocket.vkId)) {
            this.socket.log('Пользователь с таким vkID уже в комнате', 'canJoinRoom', params)
            return { error: 'Пользователь с таким ВК уже в комнате' }
        }*/

        return { result: true }
    }

    checkKnockOnRoom = (roomId): iResult<boolean> => {

        if (this.room) {
            this.socket.log('Вы уже в комнате', 'checkKnockOnRoom')
            return { error: 'Вы уже в комнате' }
        }

        const room = this.findRoomById(roomId)

        if (!room) {
            this.socket.log('Комната не существует', 'checkKnockOnRoom')
            return { error: 'Комната не существует' }
        }

        if(room.status === 'game') {
            this.socket.log('Комната в игре', 'checkKnockOnRoom')
            return { error: 'Комната в игре' }
        }

        if (!room.owner) {
            this.socket.log('У комнаты нет владельца', 'checkKnockOnRoom')
            return { error: 'У комнаты нет владельца' }
        }

        return { result: true }
    }

    leaveSocketIORoom = (toSearchRoom = true) => {
        this.socketIO.rooms.clear()

        if(toSearchRoom) {
            this.socketIO.join('search-room')
        }
    }

    filterRoomsForSearch = (room: Room) => {
        
        if(room.status !== 'wait') {
            return false
        }

        if(room.hideRoomInSearch) {
            return false
        }

        return true
    }

    findRoomById = (roomId: string) => this.server.rooms.find(item => item.id === roomId)

    deleteRoomById = (roomId: string) => deleteArrayItem(this.server.rooms, room => room.id === roomId)
    deleteMyRoom = () => this.socket.room && this.socket.room.deleteRoom()
}