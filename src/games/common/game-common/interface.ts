import { gameKey } from '../../../interfaces/games/game-common'
import MainSocket from '../../../sockets/main-socket'
import { iResult } from '../../../interfaces/common'
import { GameCommonEntity } from '.'

export interface iReconnectGameState {
    gameKey: gameKey
    state: any
}

export interface iGame {
    gameCommon: GameCommonEntity
    reconnectGame: (socket: MainSocket) => iResult<any>
    initGame: () => void
    initSocket: () => void
    unbindSocket: () => void
}


