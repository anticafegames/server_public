import  socket_io = require('socket.io')

export interface iSocketEvent {
    key: string,
    listener: any
}
