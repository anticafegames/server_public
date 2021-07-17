import socket_io = require('socket.io')
import AbstractSocket from './abstract-socket'
import AbstractSocketServer from './abstract-socket-server'

import Logger from '../logger'
import MainSocket from '../../sockets/main-socket'


export default abstract class AbstractMainSocket extends AbstractSocket {

    id: string

    constructor(server: AbstractSocketServer, id: string, socket: socket_io.Socket) {
        super(server, socket, null)
        this.id = id
        this.mainSocket = this
    }
}