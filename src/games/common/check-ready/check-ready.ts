import { GameCommonEntity } from "../game-common"
import { GameCommonEntityHelper } from "../game-common/entity-helper"
import MainSocket from "../../../sockets/main-socket"
import { iGame } from "../game-common/interface"
import { iResult } from "../../../interfaces/common"

export class CheckReadyEntity implements iGame {

    gameCommon: GameCommonEntity
    helper: GameCommonEntityHelper

    readyUsers: string[]

    constructor(gameCommon: GameCommonEntity, readyUsers: string[]) {

        this.gameCommon = gameCommon
        this.helper = gameCommon.helper

        this.readyUsers = readyUsers
    }

    userIsReady = (userId: string, socket: MainSocket) => {

        if(!this.canAddUserToReadyList(userId, socket)) {
            return
        }

        this.readyUsers.push(userId)
        socket.gameCommonSocket.broadcastRoom('user-is-ready', { userId })

        if(this.areAllReady()) {
            this.gameCommon.createGame()
        }
    }

    canAddUserToReadyList(userId: string, socket: MainSocket) {

        if(this.gameCommon.roomStatus !== 'check-ready') {
            socket.warning('В комнате не проверяется готовность', 'userIsReady')
            return false
        }

        if(!this.gameCommon.room.users.find(user => user.id === userId)) {
            socket.warning('В комнате нет юзера', 'userIsReady')
            return false
        } 

        if(this.readyUsers.includes(userId)) {
            socket.warning('Пользователь уже в списке готовых', 'userIsReady')
            return false
        }

        return true
    }

    areAllReady = () => {
        return this.gameCommon.room.users.length === this.readyUsers.length
    }

    reconnectGame = (): iResult<any> => ({ error: 'Невозможно переподключиться к игре' })
    initGame = () => {}
    initSocket = () => {}
    unbindSocket = () => {}
}