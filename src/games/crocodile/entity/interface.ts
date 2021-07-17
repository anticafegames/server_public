import { iUser } from '../../../entity/room/interface'

export type gameState = 'prepare' | 'game'

export interface iGameResponse {
    settings: iGameSettings
    teams: iGameTeamResponce[]
    state: gameState
}

export interface iGameSettings {
    timer: number
    pack: string
}

export interface iGameTeam {
    name: string,
    users: iGameUser[]
}

export interface iGameTeamResponce {
    name: string,
    users: iGameUserResponce[]
}

export interface iGameUser {
    user: iUser
}

export interface iGameUserResponce {
    userId: string
    vkId: number
}

export interface iDeleteTeamResponce {
    teamId: string
    toTeam: string
    users: string[]
}

export interface iStartGameRequest {
    settings: iGameSettings
    teams: iTeamRequest[]
}

export interface iTeamRequest {
    name: string,
    users: string[]
}

export interface iHostTeam {

    teamId: string
    teamIndex: number
    hostUserId: string
    hostUserIndex: number

    words: string[]
}

export interface iHostTeamResponce {
    teamId: string
    hostUserId: string
}

export interface iHostUserResponce {
    words: []
}