import { iVkSession, iVkAuth } from "../../interfaces/passport";

const jwt = require('jsonwebtoken');

const ROOM_TOKEN_SECRET = 'ROOM_TOKEN_SECRET.e7f97006-9108-4bbb-a415-0438e65a39f2';

export const getRoomToken = (id: string, vkAuth: iVkAuth, roomId: string) => jwt.sign({ id, vkAuth, roomId }, ROOM_TOKEN_SECRET)

export const verifyRoomToken = (token: string): Promise<any> => {

    const promise = new Promise(resolve => {

        jwt.verify(token, ROOM_TOKEN_SECRET, { maxAge: '7d' }, (error, data) => {
            resolve({ error, data })
        });
    })

    return promise
}

