import { v1 as uuidv1 } from 'uuid'
import md5 = require('md5')
import { iRoom, iUser, iResponceRoom, iResponceShortRoom, iRegRoomParams, roomStatus, iDebugRoomParams } from "./interface"
import { cloneUsers, cloneRoom, cloneShortRoom } from "./converter"
import { deleteArrayItem, deleteArrayItemByIndex } from "../../code/common/array"
import MainSocketServer from "../../sockets/main-socket-server"
import RoomSocket from '../../sockets/room/room-socket'
import MainSocket from '../../sockets/main-socket'
import { RoomEntityHelper } from './entity-helper'
import { GameCommonEntity } from '../../games/common/game-common'

export default class Room implements iRoom {

    helper: RoomEntityHelper
    server: MainSocketServer

    status: roomStatus
    
    game: GameCommonEntity

    id: string
    users: iUser[]

    password?: string
    openRoom?: boolean

    debugRoomParams: iDebugRoomParams
    hideRoomInSearch: boolean
    
    ownerId: string

    maxUsers = 8

    get owner() {
        return this.ownerId && this.helper.findUserById(this.ownerId) 
    }

    get ownerSocket() {

        const owner = this.owner

        if(owner) {
            return owner.socket as MainSocket
        }

        return null
    }

    constructor(regParams: iRegRoomParams, users: iUser[], owner: iUser, server: MainSocketServer) {

        this.id = uuidv1()
        this.users = users
        this.ownerId = owner.id
        this.server = server

        this.helper = new RoomEntityHelper(this)

        this.status = 'wait'

        this.fillParams(regParams)
    }

    private fillParams = (regParams: iRegRoomParams) => {

        this.openRoom = regParams.openRoom
        this.password = regParams.password && md5(regParams.password)

        this.debugRoomParams = regParams.debugRoomParams || this.helper.defaultDebugParams
        this.hideRoomInSearch = regParams.hideRoomInSearch
    }

    addUser = (user: iUser) => this.helper.addUser(user)

    removeUserById = (userId: string, socket: MainSocket) => this.helper.removeUserById(userId, socket)
    removeUser = (filter: (item: iUser) => boolean, socket: MainSocket) => this.helper.removeUser(filter, socket)

    disconnectUser = (socket: MainSocket) => this.helper.disconnectUser(socket)

    changeOwner = (userId: string, socket: MainSocket, needUserEmit: boolean = true) => this.helper.changeOwner(userId, socket, needUserEmit)
    changeStatus = (newStatus: roomStatus, game?: any) => this.helper.changeStatus(newStatus, game)

    cloneRoom = (ignoreUsersId: string[] = []) => this.helper.cloneRoom(ignoreUsersId)
    cloneShortRoom = () => this.helper.cloneShortRoom()

    deleteRoom = () => this.helper.deleteRoom()

    findUserById = (userId: string) => this.helper.findUserById(userId)
    findUser = (first: (user: iUser) => boolean) => this.helper.findUser(first)
}