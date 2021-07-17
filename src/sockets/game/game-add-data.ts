import { v1 as uuidv1 } from 'uuid'

import DefaultSocket from '../../code/socket/abstract-socket'

import Logger from '../../code/logger'
import MainSocket from '../main-socket'
import RoomHelper from '../../code/socket-helpers/room/room-helper'
import Room from '../../entity/room'
import MainSocketServer from '../main-socket-server'
import RoomSocket from '../room/room-socket'
import { gameKey } from '../../interfaces/games/game-common'
import { GameCommonEntity } from '../../games/common/game-common'
import AbstractGameSocket from '../../code/socket/abstract-game-socket'
import GameContainer from '../../games/common/games-container'
import GameAddDataHelper from '../../code/socket-helpers/games/add-data-helper'

export default class GameAddDataSocket extends DefaultSocket {

    server: MainSocketServer
    mainSocket: MainSocket

    eventPrefix = 'game-add-data'

    gameAddDataHelper: GameAddDataHelper

    bindEvents = () => {
        this.on('add-game-data', this.addGameData)
        this.on('get-preview-to-add-data', this.getPreviewToAddData)
    }

    initHelpers = () => {
        this.gameAddDataHelper = new GameAddDataHelper(this)
    }

    addGameData = async ({ gameKey, data }) => {

        const { error } = await this.gameAddDataHelper.addGameData(gameKey, data)

        if(error) {
            this.errorEmit('add-game-data', error)
        } else {
            this.emit('add-game-data', { result: 'ok' })
        }
    }

    getPreviewToAddData = async ({ gameKey }) => {

        const { error, result } = await this.gameAddDataHelper.getPreviewToAddData(gameKey)

        if(error) {
            this.errorEmit('get-preview-to-add-data', error)
        } else {
            this.emit('get-preview-to-add-data', { result })
        }
    }
}