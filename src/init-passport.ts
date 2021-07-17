import * as core from "express-serve-static-core";
import { decode, sign, verify } from 'jsonwebtoken'

import UserHelper from './models/User/user-helper'
import { iAcessToken, iRefreshToken } from './interfaces/passport'
import Logger from "./code/logger";

const ACCESS_TOKEN_SECRET = 'ONLINE_GYM_ACCESS_SECRET'
const REFRESH_TOKEN_SECRET = 'ONLINE_GYM_REFRESH_SECRET.2019.10.18.20.33'

const createAccessPayload = (user) => {

    const payload: iAcessToken = {
        user: {
            id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            userPhotoId: user.userPhotoId

        },
        token_type: 'access_token',
    }

    return payload
}

const createRefreshPayload = (user) => {

    const payload: iRefreshToken = {
        user: {
            id: user._id
        },
        token_type: 'refresh_token',
    }

    return payload
}

const getAuthJson = (user) => {

    const accessPayload = createAccessPayload(user);
    const refreshPayload = createRefreshPayload(user);

    return {
        result: {
            token_type: "bearer",
            access_token: sign(accessPayload, ACCESS_TOKEN_SECRET),
            refresh_token: sign(refreshPayload, REFRESH_TOKEN_SECRET),
        }
    }
}

export const initPassport = (app: core.Express) => {

    app.post('/auth', async (req, res) => {
        
        Logger.info('auth', 'initPassport', req.body)

        const { email, password } = req.body; 
        const { error, result } = await UserHelper.verifyUser(email, password);

        Logger.info('auth', 'initPassport', {error, result})

        if(error) {
            res.json({error});
        }

        if(result) {
            res.json(getAuthJson(result));
        } else {
            res.json({error: 'Неверный логин или пароль'});
        }
    });

    app.post('/refresh-token', (req, res) => {

        const { refreshToken } = req.body;

        verify(refreshToken, REFRESH_TOKEN_SECRET, { maxAge: '180d' }, async (error, decoded: iRefreshToken) => {

            if(error) {
                Logger.info('refresh-token error', 'initPassport', {error})
                return res.json({error: error});
            }
    
            const { user: { id } } = decoded
            const { error: errorFindUser, result } = await UserHelper.findById(id);

            if(error || !result) {
                Logger.info('refresh-token error', 'initPassport', {error})
                return res.status(401).json({ error: errorFindUser || 'Не найден пользователь' })
            }

            Logger.info('initPassport /refresh-token ok')

            res.json(getAuthJson(result));
        });
    });
}

export const verifyToken = (req, res, next) => {

    Logger.info('initPassport /verifyToken')

    const authorization = req.headers['authorization'];

    if(!authorization) {
        return res.status(401).json({ error: 'Unauthecated' });
    }

    const [, token] = authorization.split(' ');

    verify(token, ACCESS_TOKEN_SECRET, { maxAge: '2000ms' }, (error, decoded) => {

        if(error) {
            Logger.info('verifyToken error', 'initPassport', {error})
            return res.json({error: error});
        }

        Logger.info('verifyToken decoded', 'initPassport', {decoded})

        req.user = decoded;
        next();

    });
}