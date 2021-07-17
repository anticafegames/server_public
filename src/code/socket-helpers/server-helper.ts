import Logger from '../logger'
import AbstractSocketServer from '../socket/abstract-socket-server'
import MainSocket from '../../sockets/main-socket'
import { deleteArrayItem } from '../common/array'
import { iLogType, iLog } from '../../interfaces/debug'

export default class ServerHelper {

    server: AbstractSocketServer

    constructor(server: AbstractSocketServer) {
        this.server = server
    }
}