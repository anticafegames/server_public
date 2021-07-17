import md5 = require('md5')
import https = require('https')
const jwt = require('jsonwebtoken');

import { iVkSession, iVkAuth } from '../../interfaces/passport'
import { VK_SECRET } from '../../configs/app-config'
import { iResult } from '../../interfaces/common'
import { authErrors } from '../errors'
import { IncomingMessage } from 'http'
import { vkTokenUrl, vkClientId, vkSecret } from '../../configs/vk-cofig'
import { adminsVkId } from '../../configs/admin-config'
import { createEmitAndSemanticDiagnosticsBuilderProgram } from 'typescript';

const AUTH_TOKEN_SECRET = 'ANTICAFE_AUTH_TOKEN_SECRET.e7f97006-9108-4bbb-a415-0438e65a39f2'

export const verifySession = (session: iVkSession): iResult<string> => {

    if (!session) {
        return { error: authErrors['1'] }
    }

    const md5Hash = md5(sessionString(session))
    const sessionIsValid = md5Hash === session.sig

    if (!sessionIsValid) {
        return { error: authErrors['1'] }
    }

    return { result: 'ok' }
}

const sessionString = (session: iVkSession) => `expire=${session.expire}mid=${session.mid}secret=${session.secret}sid=${session.sid}${VK_SECRET}`

export const getVkToken = (code: string, redirectUrl: string): Promise<iResult<iVkAuth>> => {

    const promise = new Promise((resolve: any) => {

        if (!code) {
            resolve({ error: authErrors['1'] })
        }

        https.get(`${vkTokenUrl}?client_id=${vkClientId}&client_secret=${vkSecret}&redirect_uri=${redirectUrl}&code=${code}`, (res: IncomingMessage) => {
            res.on('data', function(chunk) {
                const json = JSON.parse(chunk.toString('utf8'))
                resolve({ result: json })
            });
        })
    })

    return promise
} 

export const getAuthToken = (vkAuth: iVkAuth) => jwt.sign(vkAuth, AUTH_TOKEN_SECRET)
export const verifyAuthToken = (token: string): Promise<any> => {

    const promise = new Promise(resolve => {

        jwt.verify(token, AUTH_TOKEN_SECRET, { maxAge: '180d' }, (error, data) => {
            resolve({ error, data })
        });
    })

    return promise
}

//Пока так, потом нужно переделать
export const isAdmin = (vkId: number) => adminsVkId.includes(vkId)
export const isDeveloper = (vkId: number) => adminsVkId.includes(vkId)