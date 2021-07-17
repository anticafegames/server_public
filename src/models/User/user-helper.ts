import { verify, generate } from 'password-hash'

import User from './user'
import connect from '../../code/mongo-connect'
import { iResult } from '../../interfaces/common'
import Logger from '../../code/logger'

export default class UserHelper {

    static verifyUser(email, password) {

        return new Promise<iResult<any>>(async (resolve, reject) => {

            const { result: user, error } = await connect(async () => {
                return User.findOne({ email })
            })

            if (error) {
                resolve({error})
            }

            const isVerify = verify(password, (await user).get(password));

            if(isVerify) {
                resolve({ result: user })
            } else {
                resolve({ error: 'Неверный логин или пароль' })
            }
        })
    }

    static findById(id) {
        return connect(async () => {
            return User.findById(id)
        })
    }

    static findAllUsers() {
        return connect(async () => {
            return User.find()
        })
    }

    static createUser(email, firstname, lastname, password) {

        password = generate(password)

        return connect(async () => {
            return new User({ email, firstname, lastname, password }).save({}, (err) => { Logger.error('user helper create user', err.message) })
        })
    }

    static deleteUser(userId) {
        return connect(async () => {
            return User.findByIdAndDelete(userId)
        })
    }
}