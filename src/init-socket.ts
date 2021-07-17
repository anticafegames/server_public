import SocketServer from './sockets/main-socket-server'

const initSocket = (server) => {
	
	const webrtcServer = new SocketServer()
	webrtcServer.initSocket(server)
}

export default initSocket