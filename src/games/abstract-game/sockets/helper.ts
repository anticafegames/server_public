import socket_io = require('socket.io')

import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../../code/common/array'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../../../code/socket-helpers/abstract-socket-helper'
import AbstactGameSocket from './socket'
import AbstractSocket from '../../../code/socket/abstract-socket'
import { GameCommonEntity } from '../../common/game-common'

export default class AbstactGameHelper extends AbstractHelper<AbstactGameSocket> {

    server: MainSocketServer
    socket: AbstactGameSocket
    mainSocket: MainSocket

    get game() {
        return this.socket.game
    }
}