import socket_io = require('socket.io')
import AbstractSocket from './abstract-socket'
import AbstractSocketServer from './abstract-socket-server'

import Logger from '../logger'
import MainSocket from '../../sockets/main-socket'
import { GameCommonEntity } from '../../games/common/game-common'
import GameCommonSocket from '../../sockets/game/game-common-socket'
import { iGame } from '../../games/common/game-common/interface'
import AbstractMainSocket from './abstract-main-socket'
import { timingSafeEqual } from 'crypto'
import { AbstractGame } from '../../games/common/abstract-game'
import AbstractGameHelper from '../socket-helpers/abstract-game-socket-helper'


export default abstract class AbstractGameSocket extends AbstractSocket {

    gameCommonEntity: GameCommonEntity
    gameCommonSocket: GameCommonSocket

    game: AbstractGame

    get socketPrefix() {
        return this.game.socketPrefix
    }

    constructor(mainSocket: MainSocket) {
        super(mainSocket.server, mainSocket.socket, mainSocket)
        
        this.gameCommonEntity = mainSocket.room.game as any
        this.gameCommonSocket = mainSocket.gameCommonSocket
        this.game = this.gameCommonEntity.game as any

        this.eventPrefix = this.game.socketPrefix
    }

    emitAll = (excludeUsers: string[], event: string, data: any = {}) => {
        const users = this.game.users.filter(user => !excludeUsers.includes(user.id))
        users.forEach(user => {
            if(user.socket && user.socket.gameCommonSocket && user.socket.gameCommonSocket.gameSocket) {
                user.socket.gameCommonSocket.gameSocket.emit(event, data)
            }
        })
    }

    emitUser = (userId: string, event: string, data: any = {}) => {
        const user = this.game.users.find(user => user.id === userId)

        if(user.socket && user.socket.gameCommonSocket && user.socket.gameCommonSocket.gameSocket) {
            user.socket.gameCommonSocket.gameSocket.emit(event, data)
        }
    }

    emitUserError = (userId: string, event: string, error: string, data: any = {}) => {
        const user = this.game.users.find(user => user.id === userId)

        if(user.socket && user.socket.gameCommonSocket && user.socket.gameCommonSocket.gameSocket) {
            user.socket.gameCommonSocket.gameSocket.errorEmit(event, error, data)
        }
    }
}