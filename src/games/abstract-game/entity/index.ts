import { AbstractGame } from '../../common/abstract-game'
import { gameState } from './interface'
import { iResult } from '../../../interfaces/common'
import { iReconnectGameState } from '../../common/game-common/interface'
import MainSocketServer from '../../../sockets/main-socket-server'
import GameSocket from '../sockets/socket'
import MainSocket from '../../../sockets/main-socket'
import GameEntityHelper from './entity-helper'
import { gameKey } from '../../../interfaces/games/game-common'

export default class GameEntity extends AbstractGame {

    helper: GameEntityHelper
    gameState: gameState
    socketGamePrefix = 'who-am-i'

    initGame = () => {

        this.initHelper()
        this.initSocket()



        this.gameState = 'prepare'
        this.prepareGame()
    }

    initSocket = () => {
        this.users.forEach(user => {
            user.socket.gameCommonSocket.gameSocket = new GameSocket(user.socket)
            user.socket.gameCommonSocket.gameSocket.bindEvents()
            user.socket.gameCommonSocket.gameSocket.initHelpers()
        })
    }

    unbindSocket = () => {
        this.users.forEach(user => {
            if(user.socket) {
                user.socket.gameCommonSocket.gameSocket.unbindEvents()
            }
        })
    }

    initHelper = () => {
        this.helper = new GameEntityHelper(this)
    }
 
    prepareGame = () => {
        this.broadcastUsers('prepare-game-start', { })
    }

    reconnectGame = (socket: MainSocket): iResult<any> => {

        socket.gameCommonSocket.gameSocket = new GameSocket(socket)
        socket.gameCommonSocket.gameSocket.bindEvents()
        socket.gameCommonSocket.gameSocket.initHelpers()

        return { result: {  } }
    }

    startGame = (socket: GameSocket) => {

        const { error } = this.helper.canStartGame()

        if(error) {
            return socket.errorEmit('start-game', error)
        }

        this.gameState = 'game'
        socket.emitAll([], 'start-game')
    }
}