import { gameKey } from '../../../interfaces/games/game-common'
import Room from '../../../entity/room'
import MainSocket from '../../../sockets/main-socket'
import { GameCommonEntityHelper } from './entity-helper'
import { CheckReadyEntity } from '../check-ready/check-ready'
import { AbstractGame } from '../abstract-game'
import { iReconnectGameState, iGame } from './interface'
import { iResult } from '../../../interfaces/common'
import GameContainer from '../../../games/common/games-container'

export class GameCommonEntity {

    helper: GameCommonEntityHelper

    room: Room

    gameKey: gameKey
    game: iGame
    
    readyUsers: string[]

    ownerSocket: MainSocket

    get roomStatus() {
        return this.room.status
    }

    constructor(room: Room, game: gameKey, ownerSocket: MainSocket) {

        this.room = room
        this.gameKey = game
        this.ownerSocket = ownerSocket

        this.helper = new GameCommonEntityHelper(this)
    }

    startReady = (readyUsers: string[]) => {
        this.game = new CheckReadyEntity(this, readyUsers)
        this.room.changeStatus('check-ready', this)
    }

    userIsReady = (userId: string, socket: MainSocket) => {
        if(this.roomStatus === 'check-ready') {
            (this.game as CheckReadyEntity).userIsReady(userId, socket)
        }
    }

    createGame = () => {

        const gameEntity =  GameContainer.getGame(this.gameKey)

        if(!gameEntity) {
            this.ownerSocket.log(`Игры с ключом ${this.gameKey} не существует`)
                this.cancelPrepareGame(this.ownerSocket)
                return false
        }

        const game: AbstractGame = new gameEntity(this)
        
        this.room.changeStatus('game')
        this.room.ownerSocket.gameCommonSocket.broadcastRoomAndI('end-prepare-game', { status: 'game' })

        this.game = game
        game.initGame()
    }

    cancelPrepareGame = (socket: MainSocket) => {
        if(this.helper.canCancelPrepareGame(socket)) { 
            socket.gameCommonSocket.broadcastRoomAndI('cancel-prepare-game', {})
            this.room.changeStatus('wait', null)
            socket.log('Отмена проверки готовности', 'cancelPrepareGame')
        }
    }

    stopGame = (socket: MainSocket) => {
        if(this.helper.canStopGame(socket)) {

            this.game.unbindSocket()
            this.game = null
            this.room.changeStatus('wait', null)

            socket.gameCommonSocket.broadcastRoomAndI('stop-game', {})
            socket.roomSocket.roomHelper.getRoomsBroadcastEvent()
            
            socket.log('Игра остановлена', 'stopGame')
        }
    }

    reconnectGame = (socket: MainSocket): iResult<iReconnectGameState> => {

        if(!this.game) return { error: 'Игра не создана' }

        const { error, result: state } = this.game.reconnectGame(socket)

        if(!error && state) {
            return { result: { gameKey: this.gameKey, state } }
        }

        return { error: error || 'Невозможно переподключиться к игре' }
    }
}