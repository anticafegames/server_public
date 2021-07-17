import GameEntity from '.'
import { iResult } from '../../../interfaces/common'
import MainSocket from '../../../sockets/main-socket'
import { iGameResponse, iGameSettings, iGameTeam, iHostTeamResponce, iStartGameRequest } from './interface'
import PacksHelper from '../models/packs/helper'
import { PacksSchema } from '../models/packs'
import { UserSchema } from '../../../models/User/user'
import WordsHelper from '../models/words/helper'
import { shuffle } from '../../../code/common/array'
import { cloneHostTeamResponce, cloneGameTeamsResponce } from './converter'

export default class GameEntityHelper {

    entity: GameEntity

    constructor(entity: GameEntity) {
        this.entity = entity
    }

    changeTeam = () => {



    }

    canStartGame = (): iResult<boolean> => {

        return { result: true }
    }

    canAddTeam = (): iResult<boolean> => {

        if(this.entity.users.length / 2 < this.entity.gameTeams.length + 1) {
            return { error: 'Невозможно создать комнату. Максимальное количество комнат для данного количества игроков.' }
        }

        return { result: true }
    }

    canDeleteTeam = (team: iGameTeam): iResult<boolean> => {

        if(this.entity.gameTeams.length < 3) {
            return { error: 'Невозможно удалить комнату. Минимальное количество комнат.' }
        }

        return { result: true }
    }

    getDefaultSettings = async () => {

        const { result: resultDefaultPack } = await PacksHelper.loadDefaultPack()

        const settings: iGameSettings = {
            timer: 60,
            pack: resultDefaultPack ? resultDefaultPack.id : ''
        }

        return settings
    }

    startGameDataUpdateTeams = (data: iStartGameRequest) => {
        
        this.entity.gameTeams = data.teams.map(team => ({
            name: team.name,
            users: team.users.map(user => this.entity.gameUsers.find(gameUser => gameUser.user.id === user))
        }))
    }

    shuffleTeams = () => {
        return this.entity.gameTeams = shuffle(this.entity.gameTeams)
    }

    findTeamById = (teamId: string) => {
        return this.entity.gameTeams.find(team => team.name === teamId)
    }

    emitAllOnlyOne = (userId: string, event: string, data: any) => {
        this.entity.gameUsers.forEach(user => {
            if(user.user && !user.user.disconnected && user.user.id !== userId) {
                user.user.socket.gameCommonSocket.gameSocket.emit(event, data)
            }
        })
    }

    get gameDataResponseObject(): iGameResponse {
        return {
            state: this.entity.gameState,
            teams: cloneGameTeamsResponce(this.entity.gameTeams),
            settings: this.entity.gameSettings
        }
    }

    get hostTeamResponseObject(): iHostTeamResponce {
        return cloneHostTeamResponce(this.entity.hostTeam)
    }
}