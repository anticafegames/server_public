import { v1 as uuidv1 } from 'uuid'

import DefaultSocket from '../../../code/socket/abstract-socket'

import Logger from '../../../code/logger'
import MainSocket from '../../../sockets/main-socket'
import RoomHelper from '../../../code/socket-helpers/room/room-helper'
import Room from '../../../entity/room'
import MainSocketServer from '../../../sockets/main-socket-server'
import WhoAmiHelper from './who-am-i-helper'
import { gameKey } from '../../../interfaces/games/game-common'
import { GameCommonEntity } from '../../common/game-common'
import { WhoAmIEntity } from '../entity'
import WhoAmiShemaHelper from '../models/who-am-i-words/helper'
import AbstractGameSocket from '../../../code/socket/abstract-game-socket'

export default class WhoAmIGameSocket extends AbstractGameSocket {

    server: MainSocketServer
    mainSocket: MainSocket

    game: WhoAmIEntity

    whoAmIHelper: WhoAmiHelper

    bindEvents = () => {
        this.on('select-name', this.selectName)
        this.on('start-game', this.startGame)
        this.on('show-name', this.showName)
        this.on('random-name', this.randomName)
    }

    initHelpers = () => {
        this.whoAmIHelper = new WhoAmiHelper(this)
    }

    selectName = ({ name }: any) => {
        this.game.selectName(name, this)
    }

    startGame = () => {
        this.game.startGame(this)
    }

    showName = ({ userId }: any) => {
        this.game.showName(userId, this)
    }

    randomName = async () => {
        this.emit('random-name', await this.whoAmIHelper.randomName())
    }
}