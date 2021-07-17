import { v1 as uuidv1 } from 'uuid'

import DefaultSocket from '../../code/socket/abstract-socket'

import Logger from '../../code/logger'
import MainSocket from '../main-socket'
import RoomHelper from '../../code/socket-helpers/room/room-helper'
import Room from '../../entity/room'
import MainSocketServer from '../main-socket-server'
import RoomSocket from '../room/room-socket'
import GameCommonHelper from '../../code/socket-helpers/games/game-common-helper'
import { gameKey } from '../../interfaces/games/game-common'
import { GameCommonEntity } from '../../games/common/game-common'
import AbstractGameSocket from '../../code/socket/abstract-game-socket'
import GameContainer from '../../games/common/games-container'
import GameAddDataSocket from './game-add-data'

export default class GameCommonSocket extends DefaultSocket {

    server: MainSocketServer
    mainSocket: MainSocket
    roomSocket: RoomSocket

    eventPrefix = 'game-common'

    roomHelper: RoomHelper
    gameCommonHelper: GameCommonHelper

    gameSocket: AbstractGameSocket
    addDataSocket: GameAddDataSocket

    get room() {
        return this.roomSocket.room
    }

    get gameCommon() {
        return this.roomSocket.room.game
    }
 
    constructor(mainSocket: MainSocket) {
        super(mainSocket.server, mainSocket.socket, mainSocket)

        this.roomSocket = mainSocket.roomSocket
        this.roomHelper = mainSocket.roomSocket.roomHelper
    }

    bindEvents = () => {

        this.on('ready-start', this.readyStart)
        this.on('user-is-ready', this.userIsReady)
        this.on('cancel-prepare-game', this.cancelPrepareGame)
        this.on('stop-game', this.stopGame)

        this.addDataSocket = new GameAddDataSocket(this.server, this.socket, this.mainSocket)
        this.addDataSocket.initHelpers()
        this.addDataSocket.bindEvents()
    }

    unbindEvents = () => {

        super.unbindEvents()
        this.addDataSocket.unbindEvents()

        if(this.gameSocket) {
            this.gameSocket.unbindEvents()
        }
    }

    initHelpers = () => {
        this.gameCommonHelper = new GameCommonHelper(this)
    }

    readyStart = (data) => {

        const gameKey: gameKey = data.gameKey
        const readyUsers: string[] = data.readyUsers

        const gameCommon = new GameCommonEntity(this.room, gameKey, this.mainSocket)
        gameCommon.startReady(readyUsers)

        this.broadcastRoomAndI('ready-start', { gameKey, readyUsers })
    }

    userIsReady = (data) => {

        const userId: string = data.userId
        this.gameCommonHelper.userIsReady(userId)
    }

    cancelPrepareGame = () => {
        this.gameCommonHelper.cancelPrepareGame()
    }

    stopGame = () => {
        this.gameCommonHelper.stopGame()
    }
}