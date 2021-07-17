import { WhoAmIEntity } from ".";
import { iResult } from "../../../interfaces/common";
import MainSocket from "../../../sockets/main-socket";
import WhoAmIGameSocket from "../sockets/who-am-i-socket";
import { iGameUser } from "./interface";

export class WhoAmIHelper {

    entity: WhoAmIEntity

    constructor(entity: WhoAmIEntity) {
        this.entity = entity
    }

    canSelectName = (name: string): iResult<boolean> => {
        
        if(this.entity.gameState !== 'prepare') {
            return { error: 'Игра уже началать.' }
        }

        if(!name.trim()) {
            return { error: 'Имя не может быть пустым.' }
        }

        return { result: true }
    }

    canStartGame = (socket: WhoAmIGameSocket): iResult<boolean> => {

        if(!this.userIsOwner(socket)) {
            return { error: 'Только владелец может начать игру.' }
        }

        if(this.entity.gameState !== 'prepare') {
            return { error: 'Игра уже началать.' }
        }

        if(this.entity.gameUsers.some(user => !user.nameFilled)) {
            return { error: 'Не всем игрокам загадали имя.' }
        }

        return { result: true }
    }

    canShowName = (userId: string, socket: WhoAmIGameSocket): iResult<boolean> => {

        if(userId === socket.mainSocket.id) {
            return { error: 'Нельзя открыть свое имя.' }
        }

        if(!this.findGameUserById(userId)) {
            return { error: `В комнате нет пользователя c userId: ${userId}` }
        }

        return { result: true }
    }

    userIsOwner = (socket: WhoAmIGameSocket) => {
        return socket.mainSocket.room.ownerId === socket.mainSocket.id
    }

    findGameUser = (first: (gameUser: iGameUser) => boolean) => {
        return this.entity.gameUsers.find(first)
    }

    findGameUserById = (userId: string) => {
        return this.findGameUser(user => user.user && (user.user.id === userId))
    }
}