import  socket_io = require('socket.io')
import AbstractSocketServer from '../socket/abstract-socket-server'
import AbstractSocket from '../socket/abstract-socket'
import AbstractMainSocket from '../socket/abstract-main-socket'

export default abstract class AbstractHelper<T extends AbstractSocket> {

    server: AbstractSocketServer 
    socket: T
    socketIO: socket_io.Socket
    mainSocket: AbstractMainSocket

    constructor(socket: AbstractSocket) {
        this.socket = socket as any
        this.server = socket.server
        this.socketIO = socket.socket
        this.mainSocket = socket.mainSocket || socket as AbstractMainSocket
    }

    get log() : (message: string, path?: string, ...args) => void {
        return this.socket.log
    }
    get warning() : (message: string, path?: string, ...args) => void {
        return this.socket.warning
    }
    get error() : (message: string, path?: string, ...args) => void {
        return this.error
    }
}