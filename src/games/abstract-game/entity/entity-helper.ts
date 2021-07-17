import GameEntity from '.'
import { iResult } from '../../../interfaces/common'
import MainSocket from '../../../sockets/main-socket'

export default class GameEntityHelper {

    entity: GameEntity

    constructor(entity: GameEntity) {
        this.entity = entity
    }

    canStartGame = (): iResult<boolean> => {

        return { result: true }
    }
}