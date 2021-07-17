import socket_io = require('socket.io')

import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../common/array'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../abstract-socket-helper'
import GameCommonSocket from '../../../sockets/game/game-common-socket'
import AbstractSocket from '../../socket/abstract-socket'
import { GameCommonEntity } from '../../../games/common/game-common'
import GameContainer from '../../../games/common/games-container'
import { gameKey } from '../../../interfaces/games/game-common'
import { iResult } from '../../../interfaces/common'

export default class GameCommonHelper extends AbstractHelper<GameCommonSocket> {

    server: MainSocketServer
    mainSocket: MainSocket

    userIsReady = (userId: string) => {

        if(!this.isGameCommonCreated()) return false

        const gameCommon = this.socket.room.game
        gameCommon.userIsReady(userId, this.mainSocket)
    }

    cancelPrepareGame = () => {

        if(!this.isGameCommonCreated()) return false

        const gameCommon = this.socket.room.game
        gameCommon.cancelPrepareGame(this.mainSocket)
    }

    stopGame = () => {
            
        if(!this.isGameCommonCreated()) return false

        const gameCommon = this.socket.room.game
        gameCommon.stopGame(this.mainSocket)
    }

    reconnectGame = () => {

        if(!this.socket.room.game) {
            return { error:'Неудалось подключиться к комнате' }
        }

        const { error, result: game } = this.socket.room.game.reconnectGame(this.mainSocket)

        if(error) {
            return { error }
        }

        return { result: game }
    }

    isGameCommonCreated = () => {

        const room = this.socket.room

        if(!room) {
            return false
        }

        const gameCommon = room.game

        if(!gameCommon) {
            return false
        }

        return true
    }

    addGameData = async (gameKey: gameKey, data: any): Promise<iResult<boolean>> => {

        const container = GameContainer.getGameContainer(gameKey)
        
        if(container && container.addData) {

            const { error } = await container.addData.addData(data)

            if(error) {

                this.warning(`Ошибка при добавлении данных игры. ${gameKey} ${error}`, 'game common / addGameData', data)
                return { error }
            }

            return { result: true }
        }

        this.warning(`Не найдена игра ${gameKey}`, 'game common / addGameData')
        return { error: 'Не найдена игра' }
    }

    getPreviewToAddData = async (gameKey: gameKey) => {
        
        const container = GameContainer.getGameContainer(gameKey)

        if(!container) {
            this.warning(`Не найдена игра ${gameKey}`, 'game common / getPreviewAddData')
            return { error: 'Не найдена игра' }
        }

        if(!container.addData) {
            this.warning('Игра не поддерживает добавление данных', 'game common / getPreviewAddData')
            return { error: 'Игра не поддерживает добавление данных' }
        }

        if(!container.addData.loadPreviewData) {
            this.warning('У игры нет данных для показа при добавлении', 'game common / getPreviewAddData')
            return { error: 'У игры нет данных для показа при добавлении' }
        }

        const { error, result } = await container.addData.loadPreviewData()

        if(error) {

            this.warning(`Ошибка при загрузке данных добавления. ${gameKey} ${error}`, 'game common / getPreviewAddData')
            return { error }
        }

        return { result }
    }
}