import MainSocket from '../../../sockets/main-socket'
import RoomHelper from '../../../code/socket-helpers/room/room-helper'
import Room from '../../../entity/room'
import MainSocketServer from '../../../sockets/main-socket-server'
import Helper from './helper'
import { gameKey } from '../../../interfaces/games/game-common'
import { GameCommonEntity } from '../../common/game-common'
import GameEntity from '../entity'
import AbstractGameSocket from '../../../code/socket/abstract-game-socket'

export default class GameSocket extends AbstractGameSocket {

    server: MainSocketServer
    mainSocket: MainSocket

    game: GameEntity

    whoAmIHelper: Helper

    bindEvents = () => {
        this.on('start-game', this.startGame)
    }

    initHelpers = () => {
        this.whoAmIHelper = new Helper(this)
    }

    startGame = () => {
        this.game.startGame(this)
    }
}