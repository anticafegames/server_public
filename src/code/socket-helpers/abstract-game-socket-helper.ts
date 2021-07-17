import  socket_io = require('socket.io')
import AbstractSocketServer from '../socket/abstract-socket-server'
import AbstractSocket from '../socket/abstract-socket'
import AbstractMainSocket from '../socket/abstract-main-socket'
import AbstractGameSocket from '../socket/abstract-game-socket'
import AbstractHelper from './abstract-socket-helper'

export default class AbstractGameHelper extends AbstractHelper<AbstractGameSocket> {

    get game() {
        return this.socket.game
    }

    emitAll = (excludeUsers: string[], event: string, data: any) => {
        const users = this.game.users.filter(user => !excludeUsers.includes(user.id))
        users.forEach(user => {
            user.socket.gameCommonSocket.gameSocket.emit(event, data)
        })
    }

    emitUser = (userId: string, event: string, data: any) => {
        const user = this.game.users.find(user => user.id === userId)
        user.socket.gameCommonSocket.gameSocket.emit(event, data)
    }
}