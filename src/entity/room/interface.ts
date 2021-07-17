import { iVkSession, iVkAuth } from '../../interfaces/passport'
import AbstractMainSocket from '../../code/socket/abstract-main-socket'
import MainSocket from '../../sockets/main-socket'

export type roomStatus = 'wait' | 'check-ready' | 'game'

export interface iUser {
    id: string,
    vkId: number,
    socket: MainSocket
    disconnected?: boolean
}

//Responce room params

export interface iResponceUser {
    id: string,
    vkId: number
}

export interface iRoom {
    id: string,
    users: iUser[]
}

export interface iResponceRoom {
    id: string
    status: roomStatus
    name: string
    openRoom: boolean
    users: iResponceUser[]
    ownerId: string
    maxUsers: number,
    debugParams: iDebugRoomParams
}

export interface iResponceShortRoom {
    id: string
    status: roomStatus
    openRoom: boolean
    usersLength: number
    owner: iResponceUser
    maxUsers: number
}

//join room params

export type iRoomJoinMode = 'create' | 'join'

export interface iRegRoomParams {
    password?: string
    openRoom?: boolean
    hideRoomInSearch: boolean
    debugRoomParams?: iDebugRoomParams
}

export interface iJoinRoomParams {
    roomId: string
    password?: string
}

export interface iDebugRoomParams {
    debugMode: boolean
    withoutWebRTC?: boolean
}

//room token 

export interface iRoomToken {
    id: string
    vkAuth: iVkAuth
    roomId: string
}

