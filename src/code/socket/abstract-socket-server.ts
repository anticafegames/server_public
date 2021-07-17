import socket_io = require('socket.io')
import { v1 as uuidv1 } from 'uuid'

import Socket from './abstract-main-socket'
import { iRoom } from '../../entity/room/interface'
import Logger from '../logger'
import Room from '../../entity/room'
import { deleteArrayItem } from '../common/array'
import ServerHelper from '../socket-helpers/server-helper'
import ServerLogHelper from '../socket-helpers/server-log-helper'

export default abstract class AbstractSocketServer {

	server: socket_io.Server
	helper = new ServerHelper(this)
	logHelper = new ServerLogHelper(this)

	users: Socket[] = []
	rooms: Room[] = []

	initSocket = (server) => {
		this.server = new socket_io.Server(server, {
			cors: {
				origin: "*:*",
				methods: "*"
			},
			transports: ['websocket']
		})

		this.server.on('connection', this.bindConnection)
	}

	bindConnection = (socket: socket_io.Socket) => {
		
		this.actionAfterConnection(socket)

		const id = this.getSocketId()
		const userSocket = this.createSocket(id, socket)

		socket.emit('userId', { userId: id })

		this.users.push(userSocket)

		userSocket.bindEvents()

		socket.on('disconnect', (ee) => {

			try {
				userSocket.unbindEvents()
				this.deleteSocketById(userSocket.id)
			} catch (error) {
				Logger.error(`disconnect ${error}`)
			}
		})
	}

	actionAfterConnection = (socket: socket_io.Socket) => {
		socket.rooms.clear()
		socket.join('search-room')
	}

	getSocketId = () => uuidv1()

	createSocket = (id: string, socket: socket_io.Socket): Socket => {
		console.error('DefaultSocketServer', 'Нужно переопределить метод createSocket')
		return null
	}

	deleteSocketById = (id: string) => {
		deleteArrayItem(this.users, (user: Socket) => user.id === id)
	}

	getSocketById = (id: string): Socket => this.users.find((user: Socket) => user.id === id)
}