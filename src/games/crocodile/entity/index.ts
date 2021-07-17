import { AbstractGame } from '../../common/abstract-game'
import { gameState, iDeleteTeamResponce, iGameResponse, iGameSettings, iGameTeam, iHostTeam, iStartGameRequest } from './interface'
import { iResult } from '../../../interfaces/common'
import { iReconnectGameState } from '../../common/game-common/interface'
import MainSocketServer from '../../../sockets/main-socket-server'
import GameSocket from '../sockets/socket'
import MainSocket from '../../../sockets/main-socket'
import GameEntityHelper from './entity-helper'
import { iGameUser } from './interface'
import { cloneGameTeamsResponce } from './converter'
import TeamNamesHelper from '../../common/models/team-names/helper'
import { deleteArrayItem } from '../../../code/common/array'
import { AsyncResource } from 'async_hooks'
import WordsHelper from '../models/words/helper'

export default class CrocodileGameEntity extends AbstractGame {

    helper: GameEntityHelper

    gameSettings: iGameSettings

    gameTeams: iGameTeam[] = []
    gameUsers: iGameUser[] = []

    gameState: gameState
    socketGamePrefix = 'crocodile'

    hostTeam: iHostTeam

    initGame = async () => {

        this.initHelper()
        this.initSocket()

        await this.createDefaultParams()

        this.gameState = 'prepare'
        this.prepareGame()
    }

    initSocket = () => {
        this.users.forEach(user => {
            user.socket.gameCommonSocket.gameSocket = new GameSocket(user.socket)
            user.socket.gameCommonSocket.gameSocket.bindEvents()
            user.socket.gameCommonSocket.gameSocket.initHelpers()
        })
    }

    unbindSocket = () => {
        this.users.forEach(user => {
            if (user.socket) {
                user.socket.gameCommonSocket.gameSocket.unbindEvents()
            }
        })
    }

    initHelper = () => {
        this.helper = new GameEntityHelper(this)
    }

    prepareGame = () => {
        this.broadcastUsers('prepare-game-start', this.helper.gameDataResponseObject)
    }

    reconnectGame = (socket: MainSocket): iResult<any> => {

        socket.gameCommonSocket.gameSocket = new GameSocket(socket)
        socket.gameCommonSocket.gameSocket.bindEvents()
        socket.gameCommonSocket.gameSocket.initHelpers()

        switch (this.gameState) {

            case 'prepare':
                return { result: this.helper.gameDataResponseObject }

            case 'game':

                if (this.hostTeam.hostUserId === socket.id) {
                    return { result: { ...this.helper.gameDataResponseObject, hostTeam: this.helper.hostTeamResponseObject, hostUserData: { words: this.hostTeam.words } } }
                }

                return { result: { ...this.helper.gameDataResponseObject, hostTeam: this.helper.hostTeamResponseObject } }
        }
    }

    startGame = async (data: iStartGameRequest, socket: GameSocket) => {

        const { error } = this.helper.canStartGame()

        if (error) {
            return socket.errorEmit('start-game', error)
        }

        this.gameSettings = data.settings

        this.helper.startGameDataUpdateTeams(data)
        this.helper.shuffleTeams()

        const hostTeam = this.gameTeams[0]
        const words = await (await WordsHelper.randomWords('605391653d4faacb5af0d752', 15, [])).result

        this.hostTeam = {

            teamIndex: 0,
            hostUserIndex: 0,
            teamId: hostTeam.name,
            hostUserId: hostTeam.users[0].user.id,

            words
        }

        this.gameState = 'game'
        this.helper.emitAllOnlyOne(this.hostTeam.hostUserId, 'start-game', { result: { gameData: this.helper.gameDataResponseObject, hostTeam: this.helper.hostTeamResponseObject } })
        socket.emitUser(this.hostTeam.hostUserId, 'start-game', { result: { gameData: this.helper.gameDataResponseObject, hostTeam: this.helper.hostTeamResponseObject, hostUserData: { words } } })
    }

    createDefaultParams = async () => {

        this.gameSettings = await this.helper.getDefaultSettings()
        this.gameUsers = this.users.map(user => ({ user: user }))

        const { result: teamNames } = await TeamNamesHelper.randomTeams(2)

        this.gameTeams.push({ name: teamNames[0], users: [] })
        this.gameTeams.push({ name: teamNames[1], users: [] })

        this.gameUsers.forEach((user, index) => {

            if (index % 2 === 0) {
                this.gameTeams[0].users.push(user)
            }
            else {
                this.gameTeams[1].users.push(user)
            }
        })
    }

    addTeam = async (socket: GameSocket) => {

        const { error: canAddError } = this.helper.canAddTeam()

        if (canAddError) {
            return socket.errorEmit('add-team', canAddError)
        }

        const { error: requestTeamNameError, result } = await TeamNamesHelper.randomTeams(1, this.gameTeams.map(team => team.name))

        if (requestTeamNameError) {
            return socket.errorEmit('add-team', 'Не удалось создать комнату')
        }

        const team = { name: result[0], users: [] }
        this.gameTeams.push(team)

        this.broadcastUsers('add-team', { result: team })
    }

    changeTeam = async (socket: GameSocket, userId: string, from: string, to: string, index: number) => {

        const fromTeam = this.gameTeams.find(team => team.name === from)
        const toTeam = this.gameTeams.find(team => team.name === to)

        const user = fromTeam.users.find(item => item.user.id === userId)
        if (!fromTeam || !toTeam || !user) return

        deleteArrayItem(fromTeam.users, item => item.user.id === userId)
        toTeam.users.splice(index, 0, user)

        this.broadcastAllExceptOwner('change-team', { userId, from, to, index })
    }

    deleteTeam = async (socket: GameSocket, teamId: string) => {

        const team = this.helper.findTeamById(teamId)

        if (!team) {
            return socket.emit('delete-team', { error: 'Не найдена комната', teamId })
        }

        const { error: canDeleteError } = this.helper.canDeleteTeam(team)

        if (canDeleteError) {
            return socket.emit('delete-team', { error: canDeleteError, teamId })
        }

        const users = team.users
        deleteArrayItem(this.gameTeams, item => item.name === teamId)

        this.gameTeams[0].users.push(...users)

        const data: iDeleteTeamResponce = {
            teamId, toTeam: this.gameTeams[0].name, users: users.map(user => user.user.id)
        }

        return socket.broadcastRoomAndI('delete-team', { result: data, teamId })
    }

}