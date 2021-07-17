import { AbstractGame } from "../../common/abstract-game"
import { iGameUser, gameState } from "./interface"
import { shuffle } from "../../../code/common/array"
import { cloneGameUsersResponce } from "./converter"
import { iResult } from "../../../interfaces/common"
import { iReconnectGameState } from "../../common/game-common/interface"
import MainSocketServer from "../../../sockets/main-socket-server"
import WhoAmIGameSocket from "../sockets/who-am-i-socket"
import MainSocket from "../../../sockets/main-socket"
import { WhoAmIHelper } from "./entity-helper"

export class WhoAmIEntity extends AbstractGame {

    helper: WhoAmIHelper

    gameUsers: iGameUser[]
    gameState: gameState
    socketGamePrefix = 'who-am-i'

    initGame = () => {

        this.initHelper()
        this.initSocket()

        this.gameUsers = shuffle(this.users.map(user => ({ user: user, name: '', nameFilled: false, userSeesName: false })))
        const lastIndex = this.gameUsers.length - 1

        this.gameUsers.forEach((user, index) => {
            user.ordernum = index + 1
            user.whoMakesUp = this.gameUsers[index === lastIndex ? 0 : index + 1].user.id
        })

        this.gameState = 'prepare'
        this.prepareGame()
    }

    initSocket = () => {
        this.users.forEach(user => {
            user.socket.gameCommonSocket.gameSocket = new WhoAmIGameSocket(user.socket)
            user.socket.gameCommonSocket.gameSocket.bindEvents()
            user.socket.gameCommonSocket.gameSocket.initHelpers()
        })
    }

    unbindSocket = () => {
        this.users.forEach(user => {
            if(user.socket) {
                user.socket.gameCommonSocket.gameSocket.unbindEvents()
            }
        })
    }

    initHelper = () => {
        this.helper = new WhoAmIHelper(this)
    }
 
    prepareGame = () => {
        this.broadcastUsers('prepare-game-start', { users: cloneGameUsersResponce(this.gameUsers) })
    }

    reconnectGame = (socket: MainSocket): iResult<any> => {

        socket.gameCommonSocket.gameSocket = new WhoAmIGameSocket(socket)
        socket.gameCommonSocket.gameSocket.bindEvents()
        socket.gameCommonSocket.gameSocket.initHelpers()

        return { result: { users: cloneGameUsersResponce(this.gameUsers), gameState: this.gameState } }
    }

    selectName = (name: string, socket: WhoAmIGameSocket) => {

        const { error } = this.helper.canSelectName(name)

        if(error) {
            return socket.errorEmit('select-name', error)
        }

        const user = this.helper.findGameUser(user => user.whoMakesUp === socket.mainSocket.id)
        user.name = name
        user.nameFilled = true

        socket.emitAll([user.user.id], 'select-name', { userId: user.user.id, name })
        socket.emitUser(user.user.id, 'select-name', { nameFilled: true })
    }

    startGame = (socket: WhoAmIGameSocket) => {

        const { error } = this.helper.canStartGame(socket)

        if(error) {
            return socket.errorEmit('start-game', error)
        }

        this.gameState = 'game'
        socket.emitAll([], 'start-game')
    }

    showName = (userId: string, socket: WhoAmIGameSocket) => {

        const { error } = this.helper.canShowName(userId, socket)

        if(error) {
            return socket.error(error, 'WhoAmIEntity/showName')
        }

        const user = this.helper.findGameUserById(userId)
        user.userSeesName = true

        socket.emitAll([userId], 'show-name', { userId })
        socket.emitUser(userId, 'show-name', { name: user.name })
    }
}