import { iUser } from '../../../entity/room/interface'

export type gameState = 'prepare' | 'game'

export interface iGameUser {
    user: iUser
    name: string
    nameFilled: boolean
    userSeesName: boolean
    ordernum: number
    whoMakesUp: string
}

export interface iGameUserResponce {
    userId: string
    vkId: number
    name: string
    nameFilled: boolean
    userSeesName: boolean
    ordernum: number
    whoMakesUp: string
}