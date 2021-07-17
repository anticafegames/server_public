import Schema, { WhoAmISchema, iWhoAmIWord } from '.'
import { randomNumber } from '../../../../code/common'
import { prepareWordForDataBase } from '../../../../code/common/game'
import connect from '../../../../code/mongo-connect'
import { iResult } from '../../../../interfaces/common'

export default class WhoAmIWordsHelper {

    static findBylevel(level: number) {
        return connect(async () => {
            return Schema.findOne({ level: { $eq: level } })
        })
    }

    static findAll() {
        return connect(async () => {
            return Schema.find()
        })
    }

    static createNewLevel(level) {
        return connect(async () => {
            new Schema({ level: level, words: [] }).save()
        })
    }

    static addWords(level: number, words: string[]) {
        return connect(() => {
            //Пока не понял как сделать одним запросом, чтобы пропускались не слова, которые уже есть
            return Promise.all(words.map(text => new Schema({ level, text }).save()))
        })
    }

    static randomWord(level) {
        return connect<string>(async () => {
            const result = await Schema.aggregate().sample(1)
            return result[0]['text'] as string
        })
    }

    static setWordToDataBase = (word: string) => prepareWordForDataBase(word)

    /*static createUser(email, firstname, lastname, password) {

        
        password = generate(password)

        return connect(() => {
            return new User({ email, firstname, lastname, password }).save({}, (err) => { Logger.error('user helper create user', err.message) })
        })
    }

    static deleteUser(userId) {
        return connect(() => {
            return User.findByIdAndDelete(userId)
        })
    }*/
}