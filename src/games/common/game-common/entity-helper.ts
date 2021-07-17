import { GameCommonEntity } from "."
import Room from "../../../entity/room"
import MainSocket from "../../../sockets/main-socket"

export class GameCommonEntityHelper {

    entity: GameCommonEntity

    get room() {
        return this.entity.room
    }

    constructor(entity: GameCommonEntity) {
        this.entity = entity
    }

    canCancelPrepareGame = (socket: MainSocket) => {

        const room = this.entity.room

        if(room.ownerId !== socket.id) {
            socket.log('Не владелец', 'canCancelPrepareGame')
            return false
        }

        if(room.status !== 'check-ready') {
            socket.log('Не проверяется готовность', 'canCancelPrepareGame')
            return false
        }

        return true
    }

    canStopGame = (socket: MainSocket) => {

        const room = this.entity.room

        if(room.ownerId !== socket.id) {
            socket.log('Не владелец', 'canCancelPrepareGame')
            return false
        }

        if(room.status !== 'game') {
            socket.log('Не начали игру', 'canStopGame')
            return false
        }

        return true
    }

    canReconnectGame = (socket: MainSocket) => {

        switch (this.entity.gameKey) {

            case 'whoAmI':
                return true

        }

    }
}