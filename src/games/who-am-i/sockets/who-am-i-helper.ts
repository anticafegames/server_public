import socket_io = require('socket.io')

import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../../code/common/array'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../../../code/socket-helpers/abstract-socket-helper'
import WhoAmiSocket from './who-am-i-socket'
import AbstractSocket from '../../../code/socket/abstract-socket'
import { GameCommonEntity } from '../../common/game-common'
import WhoAmiShemaHelper from '../models/who-am-i-words/helper'

export default class WhoAmiHelper extends AbstractHelper<WhoAmiSocket> {

    server: MainSocketServer
    socket: WhoAmiSocket
    mainSocket: MainSocket

    get game() {
        return this.socket.game
    }

    randomName = async() => {

        const result = await WhoAmiShemaHelper.randomWord(1)

        if(result.error) {
            return result
        }

        let name: string = result.result!
        name = name[0] + name.substring(1).toLowerCase()

        result.result = name

        return result
    }
}