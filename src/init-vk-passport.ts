import * as core from "express-serve-static-core"
import { iVkSession, iVkAuth, iAuthResult, iAppKey } from "./interfaces/passport"
import { iResult } from "./interfaces/common"
import { verifySession, getAuthToken, verifyAuthToken, getVkToken, isAdmin as isadmin, isDeveloper as isdeveloper } from "./code/passport/vk-pasport-helper"
import { authErrors } from "./code/errors"
import Logger from "./code/logger"

export const initVkPassport = (app: core.Express) => {

    app.post('/vk-auth', async (req, res) => {

        const session: iVkSession = req.body.session

        if (!session) {
            res.json({ error: { code: 404, message: 'Нет сессии' } })
        }

        res.json(verifySession(session))
    })

    app.post('/vk-auth-new', async (req, res) => {

        const vkAuth: iVkAuth = req.body.vkAuth

        if (!vkAuth) {
            res.json({ error: { code: 404, message: 'Нет токена' } })
            return
        }

        //Не знаю, стоит ли проверять токен запросом к вк, для таких игр вроде не особо нужно
        
        const anticafe_token = getAuthToken(vkAuth)
        
        const { access_token, user_id, appKey } = vkAuth

        const isAdmin = isadmin(user_id)
        const isDeveloper = isdeveloper(user_id)

        const result: iResult<iAuthResult> = { result: { anticafe_token, access_token, user_id, appKey, isAdmin, isDeveloper } }
        
        res.json(result)
    })

    app.post('/verify-anticafe-token', async (req, res) => {
        
        const anticafe_token: string = req.body.token
        const appKey: iAppKey = req.body.appKey

        if(!anticafe_token) {
            res.json({ error: { code: 404, message: 'Нет токена' } })
            return
        }

        const { error, data: vkAuth } = await verifyAuthToken(anticafe_token)

        if(error) {
            res.json({ error })
            return
        }

        if(vkAuth.appKey !== appKey) {
            res.json({ error: 'Токен не из того приложения' })
            return
        }
    
        const { access_token, user_id } = vkAuth

        const isAdmin = isadmin(user_id)
        const isDeveloper = isdeveloper(user_id)

        const result: iResult<iAuthResult> = { result: { anticafe_token, access_token, user_id, appKey, isAdmin, isDeveloper } }
        res.json(result)
    })
}