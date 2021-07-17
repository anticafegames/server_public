import Room from '.'
import { roomStatus, iUser, iDebugRoomParams } from './interface'
import MainSocket from '../../sockets/main-socket'
import { deleteArrayItemByIndex, deleteArrayItem } from '../../code/common/array'
import { cloneUsers, cloneRoom, cloneShortRoom } from "./converter"

export class RoomEntityHelper {

    room: Room

    constructor(room: Room) {
        this.room = room
    }

//Права начало

    canChangeStatus = (newStatus: roomStatus) => {
        return true
    }

//Права конец

    addUser = (user: iUser) => {
        if(this.room.users.find(item => item.id === user.id)) return

        this.room.users.push(user)

        if(this.room.debugRoomParams.debugMode && !this.room.owner) {
            this.room.ownerId = user.id
        }
    }

    removeUserById = (userId: string, socket: MainSocket) => this.removeUser(user => user.id === userId, socket)
    removeUser = (filter: (item: iUser) => boolean, socket: MainSocket) => {

        let changes = []

        const index = this.room.users.findIndex(filter)

        if(index === -1) {
            return
        }

        const deletedUser = this.room.users[index]
        const isOwner = deletedUser.id === this.room.ownerId

        if(this.room.users.length !== 1 && isOwner) {

            const ownerIndex = index === 0 ? 1 : 0
            const ownerId = this.room.users[ownerIndex].id

            this.room.changeOwner(ownerId, socket, false)
        }

        deleteArrayItemByIndex(this.room.users, index)
        deletedUser.socket.socket.to('search-room')

        if(!this.room.users.length && !this.room.debugRoomParams.debugMode) {
            this.room.deleteRoom()
            socket.roomSocket.roomHelper.getRoomsBroadcastEvent()
        }
    }

    disconnectUser = (socket: MainSocket) => {

        if (this.room.status !== 'game') {

            this.removeUserById(socket.id, socket)
            socket.room = null

        } else {
            
            const roomUser = this.findUserById(socket.id)
            
            if (roomUser) {
                roomUser.disconnected = true
                roomUser.socket = null

                if(!this.findUser(user => !user.disconnected)) {
                    this.deleteRoom()
                    socket.roomSocket.roomHelper.getRoomsBroadcastEvent()
                }
            }
        }
    }

    findUserById = (userId: string) => {
        return this.findUser(user => user.id === userId)
    }

    findUser = (first: (user: iUser) => boolean) => {
        return this.room.users.find(first)
    }

    changeOwner = (userId: string, socket: MainSocket, needUserEmit: boolean = true) => {
        if(this.room.users.find(user => user.id === userId)) {
            this.room.ownerId = userId

            if(needUserEmit) {
                socket.roomSocket.emit('room_change_owner', { ownerId: userId })
            }

            socket.roomSocket.broadcastRoom('room_change_owner', { ownerId: userId })
            socket.roomSocket.roomHelper.getRoomsBroadcastEvent()
        }
    }

    changeStatus = (newStatus: roomStatus, game?: any) => {

        if(this.canChangeStatus(newStatus)) {

            const oldStatus = this.room.status

            this.room.status = newStatus

            if(game) {
                this.room.game = game
            }

            if(!game && newStatus === 'wait') {
                this.room.game = null
            }

            if((oldStatus === 'wait' || newStatus === 'wait') && this.room.owner) {
                (this.room.owner.socket as MainSocket).roomSocket.getRoomsEvent()
            }
        }
    }

    cloneRoom = (ignoreUsersId: string[] = []) => cloneRoom(this.room, ignoreUsersId)
    cloneShortRoom = () => cloneShortRoom(this.room)

    deleteRoom = () => !this.room.debugRoomParams.debugMode && deleteArrayItem(this.room.server.rooms, room => room.id === this.room.id)

    defaultDebugParams: iDebugRoomParams = { debugMode: false }
}