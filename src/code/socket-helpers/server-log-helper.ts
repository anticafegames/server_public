import Logger from '../logger'
import AbstractSocketServer from '../socket/abstract-socket-server'
import MainSocket from '../../sockets/main-socket'
import { deleteArrayItem } from '../common/array'
import { iLogType, iLog } from '../../interfaces/debug'

export default class ServerLogHelper {

    server: AbstractSocketServer
    
    logListeners: MainSocket[] = []

    constructor(server: AbstractSocketServer) {
        this.server = server
    }

    //Здорово бы это перенести в свой сервер лог хелпер
    addLogListener = (socket: MainSocket) => this.logListeners.push(socket)
    removeLogListener = (userId: string) => deleteArrayItem(this.logListeners, item => item.userId === userId)

    emitLog = (type: iLogType, userId: string, message: string, path: string = '', data: any = {}) => {
        const log: iLog = { type, userId, message, path, data }
        this.logListeners.forEach(listener => listener.socket.emit('debug/log', log))
    }

    log = (message: string, userId: string, path?: string, ...args) => { 

        const pathString = `userId: ${userId} path: ${path}`
        const data = { args }

        Logger.info(message, pathString, data)
        this.emitLog('info', userId, message, pathString, data)
    }

    socketIOLog = (message: string, userId: string, path?: string, ...args) => { 

        const pathString = `userId: ${userId} path: ${path}`
        const messageString = `Socket: ${message}`
        const data = { args }

        Logger.info(messageString, pathString, data)
        this.emitLog('socket', userId, message, pathString, data)
    }

    debugLog = (message: string, userId: string, path?: string, ...args) => { 

        const pathString = `userId: ${userId} path: ${path}`
        const messageString = `Debug: ${message}`
        const data = { args }

        Logger.info(message, pathString, data)
        this.emitLog('debug', userId, message, pathString, data)
    }

    warning = (message: string, userId: string, path?: string, ...args) => { 

        const pathString = `userId: ${userId} path: ${path}`
        const data = { args }
        
        Logger.warning(message, path, data)
        this.emitLog('warning', userId, message, pathString, data)
    }

    error = (message: string, userId: string, path?: string, ...args) => {

        const pathString = `userId: ${userId} path: ${path}`
        const data = { args }

        Logger.error(message, path, data)
        this.emitLog('error', userId, message, pathString, data)
    }
}