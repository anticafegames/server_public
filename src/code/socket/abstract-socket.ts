import socket_io = require('socket.io')

import Logger from '../logger'
import MainSocket from '../../sockets/main-socket'
import AbstractSocketServer from './abstract-socket-server'
import AbstractMainSocket from './abstract-main-socket'
import { iSocketEvent } from '../../interfaces/socket'
import { runInThisContext } from 'vm'

export default abstract class AbstractSocket {

    socket: socket_io.Socket
    server: AbstractSocketServer
    mainSocket: AbstractMainSocket
    eventPrefix = ''

    bindedEvents: iSocketEvent[] = []

    get userId() {
        return ((this.mainSocket || this) as MainSocket).id
    }

    constructor(server: AbstractSocketServer, socket: socket_io.Socket, mainSocket: AbstractMainSocket) {
        this.server = server
        this.socket = socket
        this.mainSocket = mainSocket
    }

    bindEvents = () => {
        console.error('DefaultSocket', 'Нужно переопределить метод bindEvents')
    }

    unbindEvents = () => {
        this.offAllEvents()
    }

    offAllEvents = () => {
        
        this.bindedEvents.forEach(event => {

            try {
                this.socket.removeListener(event.key, event.listener)
                this.log(`Отвязались от ивента ${event.key}`, 'socket')
            } 
            catch (error) {
                this.error(`Ошибка при анбинде сокет ивента ${event.key}. Error: ${error}`, 'AbstractSocket.offAllEvents', typeof this.socket, typeof this.socket.off)
            }
        })
    }

    initHelpers = () => {
        console.error('DefaultSocket', 'Нужно переопределить метод initHelpers')
    }

    on = (event: string, listener: any) => {

        const eventKey = (this.eventPrefix ? `${this.eventPrefix}/` : '') + event
        const _listener = (data) => {

            this.socketIOLog(`Socket event ${eventKey}`, 'Data:', data)

            try {
                listener(data)
            }
            catch (e) {
                this.error(`Socket Event: ${eventKey} Message: ${e}`)
            }
        }

        this.socket.on(eventKey, _listener)
        this.bindedEvents.push({ key: eventKey, listener: _listener })
        this.log(`Привязались к ивенту: ${eventKey}`)
    }

    off = (event: string, listener: any) => {
        const eventKey = (this.eventPrefix ? `${this.eventPrefix}/` : '') + event
        try {
            this.socket.removeListener(eventKey, listener)
            this.log(`Отвязались от ивента ${eventKey}`, 'socket')
        } 
        catch (error) {
            this.error(`Ошибка при анбинде сокет ивента ${eventKey}. Error: ${error}`, 'AbstractSocket.off', typeof this.socket)
        }
        
    }

    emit = (event: string, data: any) => { 
        const eventKey = (this.eventPrefix ? `${this.eventPrefix}/` : '') + event
        this.socket.emit(eventKey, data) 
        this.socketIOLog(`Socket emit ${eventKey}`, '', data)
    }
    errorEmit = (event: string, error: string, args?: any) => this.emit(event, { error, ...args })

    clientToastError = (message: string) => {
        this.socket.emit('show-error-toast', message) 
    }

    broadcastEmit = (roomId: string, event: string, data: any) => { 
        const eventKey = (this.eventPrefix ? `${this.eventPrefix}/` : '') + event
        this.socket.broadcast.to(roomId).emit(eventKey, data)
        this.socketIOLog(`broadcastEmit to:${roomId} event: ${eventKey}`, '', data, this.socket.rooms)
    }

    broadcastRoom = (event: string, data: any) => {
        try {
            const mainSocket = (this.mainSocket || this) as MainSocket
            if(mainSocket.room) {
                this.broadcastEmit(mainSocket.room.id, event, data)
            }
            else {
                throw new Error('Нет комнаты')
            }
        }
        catch(error) {
            this.error(error, 'broadcastRoom', `event: ${event}`)
        }
    }

    broadcastRoomAndI = (event: string, data: any) => {
        this.broadcastRoom(event, data)
        this.emit(event, data)
    }

    getSocketById = (id: string) => this.server.getSocketById(id)

    log = (message: string, path?: string, ...args) => { this.server.logHelper.log(message, this.userId, `userId: ${this.userId} path: ${path}`, { args }) }
    socketIOLog = (message: string, path?: string, ...args) => { this.server.logHelper.socketIOLog(message, this.userId, `userId: ${this.userId} path: ${path}`, { args }) }
    debugLog = (message: string, path?: string, ...args) => { this.server.logHelper.debugLog(message, this.userId, `userId: ${this.userId} path: ${path}`, { args }) }
    warning = (message: string, path?: string, ...args) => { this.server.logHelper.warning(message, this.userId, path, { args }) }
    error = (message: string, path?: string, ...args) => { this.server.logHelper.error(message, this.userId, path, args) }
}