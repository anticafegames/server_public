import socket_io = require('socket.io')

import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../common/array'
import MainSocketServer from '../../../sockets/main-socket-server'
import AbstractHelper from '../abstract-socket-helper'
import GameAddDataSocket from '../../../sockets/game/game-add-data'
import AbstractSocket from '../../socket/abstract-socket'
import { GameCommonEntity } from '../../../games/common/game-common'
import GameContainer from '../../../games/common/games-container'
import { gameKey } from '../../../interfaces/games/game-common'
import { iResult } from '../../../interfaces/common'

export default class GameAddDataHelper extends AbstractHelper<GameAddDataSocket> {

    server: MainSocketServer
    mainSocket: MainSocket

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