const jwt = require('jsonwebtoken')

const KNOCK_TOKEN_SECRET = 'KNOCK_TOKEN_SECRET.e7f97006-9108-4bbb-a415-0438e6ewds5a39f2'

export const getKnockToken = (id: string, roomId: string) => jwt.sign({ id, roomId }, KNOCK_TOKEN_SECRET)

export const verifyKnockToken = (token: string): Promise<any> => {

    const promise = new Promise(resolve => {

        jwt.verify(token, KNOCK_TOKEN_SECRET, { maxAge: '7d' }, (error, data) => {
            resolve({ error, data })
        });
    })

    return promise
}

