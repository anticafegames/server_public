import socket_io = require('socket.io')
import { v1 as uuidv1 } from 'uuid'
import DefaultSocketServer from '../code/socket/abstract-socket-server'

import MainSocket from './main-socket'
import { iRoom } from '../entity/room/interface'

export default class MainSocketServer extends DefaultSocketServer {

    createSocket = (id: string, socketIO: socket_io.Socket) => {
        const socket = new MainSocket(this, id, socketIO)
        socket.initHelpers()
        return socket
    }
}