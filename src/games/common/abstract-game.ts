import { GameCommonEntity } from './game-common'
import { iGame, iReconnectGameState } from './game-common/interface'
import { iResult } from '../../interfaces/common'
import MainSocket from '../../sockets/main-socket'

export class AbstractGame implements iGame {

    gameCommon: GameCommonEntity
    socketGamePrefix: string

    get socketPrefix() {
        return `game/${this.socketGamePrefix}`
    }

    get room() {
        return this.gameCommon.room
    }

    get users() {
        return this.room.users
    }

    get gameKey() {
        return this.gameCommon.gameKey
    }

    constructor(gameCommon: GameCommonEntity) {
        this.gameCommon = gameCommon
    }

    initGame = () => {
        console.error('AbstractGame', 'Нужно переопределить метод initGame')
    }

    initSocket = () => {
        console.error('AbstractGame', 'Нужно переопределить метод initSocket')
    }

    initHelper = () => {
        console.error('AbstractGame', 'Нужно переопределить метод initSocket')
    }

    unbindSocket = () => {
        console.error('AbstractGame', 'Нужно переопределить метод unbindSocket')
    }

    broadcastUsers = (event: string, data: any) => {
        this.room.ownerSocket.broadcastRoomAndI(`${this.socketPrefix}/${event}`, data)
    }

    broadcastAllExceptOwner = (event: string, data: any) => {
        this.room.ownerSocket.broadcastRoom(`${this.socketPrefix}/${event}`, data)
    }

    reconnectGame = (socket: MainSocket): iResult<any> => ({ error: 'Невозможно переподключиться к игре' })
}