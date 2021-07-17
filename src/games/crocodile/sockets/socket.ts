import MainSocket from '../../../sockets/main-socket'
import RoomHelper from '../../../code/socket-helpers/room/room-helper'
import Room from '../../../entity/room'
import MainSocketServer from '../../../sockets/main-socket-server'
import SocketHelper from './helper'
import { gameKey } from '../../../interfaces/games/game-common'
import { GameCommonEntity } from '../../common/game-common'
import GameEntity from '../entity'
import AbstractGameSocket from '../../../code/socket/abstract-game-socket'
import { iStartGameRequest } from '../entity/interface'

export default class GameSocket extends AbstractGameSocket {

    server: MainSocketServer
    mainSocket: MainSocket

    game: GameEntity

    socketHelper: SocketHelper

    bindEvents = () => {
        this.on('start-game', this.startGame)
        this.on('start-round', this.startRound)
        this.on('add-team', this.addTeam)
        this.on('change-team', this.changeTeam)
        this.on('delete-team', this.deleteTeam)
        this.on('load-packs', this.loadPacks)
    }

    initHelpers = () => {
        this.socketHelper = new SocketHelper(this)
    }

    startGame = (data: iStartGameRequest) => {
        this.game.startGame(data, this)
    }

    addTeam = () => {
        this.game.addTeam(this)
    }
    changeTeam = ({ userId, from, to, index }: any) => {
        this.game.changeTeam(this, userId, from, to, index)
    }

    deleteTeam = ({ team }: any) => {
        this.game.deleteTeam(this, team)
    }

    loadPacks = async () => {
        this.emit('load-packs', await this.socketHelper.loadPacks())
    }

    startRound = () => {
        this.broadcastRoomAndI('start-round', {  })
    }
}