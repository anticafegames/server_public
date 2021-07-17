import { iResult } from '../../interfaces/common'
import { gameKey } from '../../interfaces/games/game-common' 

import { AbstractGame } from './abstract-game'

export interface iAddDataObject {
    addData?: (data: any) => Promise<iResult<any>>
    loadPreviewData?: () => Promise<iResult<any>>
}

export interface iContainerGame {

    gameKey: gameKey
    gameEntity: typeof AbstractGame

    addData?: iAddDataObject
}

export default class GameContainer {

    static _games = new Map<gameKey, iContainerGame>()

    static registerGame = (game: iContainerGame) => {
        GameContainer._games.set(game.gameKey, game)
    }

    static getGame(gameKey: gameKey) {
        const game = GameContainer.getGameContainer(gameKey)
        return game && game.gameEntity
    }

    static getGameContainer(gameKey: gameKey) {
        return GameContainer._games.get(gameKey)
    }
}