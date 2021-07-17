import { workerData } from 'worker_threads'
import Schema, { CrocodileWordsSchema, iCrocodileWord } from '.'
import { randomNumber } from '../../../../code/common'
import { prepareWordForDataBase } from '../../../../code/common/game'
import connect from '../../../../code/mongo-connect'
import { iResult } from '../../../../interfaces/common'
import PackHelper from '../packs/helper'

export default class CrocodileWordsHelper {

    static findAll() {
        return connect(async () => {
            return Schema.find()
        })
    }

    static addWords(packId: string, words: string[]) {
        return connect(async () => {

            const isExist = await PackHelper.isExistById(packId)

            if (!isExist) {
                return { error: 'Пакет не найден' }
            }

            //Пока не понял как сделать одним запросом, чтобы пропускались не слова, которые уже есть
            return Promise.all(words.map(text => new Schema({ packId, text }).save()))
        })
    }

    static randomWords(packId: string, countWords: number, selectedWords: string[]) {

        return connect<string[]>(async () => {
            const words: string[] = await this._randomWords(packId, countWords, [], selectedWords) 
            return words
        })
    }

    private static async _randomWords(packId: string, countWords: number, words: string[], selectedWords: string[]) {

        return await new Promise<string[]>(async resolve => {

            const result: iCrocodileWord[] = await Schema.aggregate().sample(countWords)

            result.forEach(word => {
                if(!words.some(w => w === word.text) && !selectedWords.some(w => w === word.text)) {
                    words.push(word.text)
                }
            })

            if(words.length <= countWords) {
                await this._randomWords(packId, words.length - countWords, words, selectedWords)
            }

            resolve(words)
        })
    }

    static setWordToDataBase = (word: string) => prepareWordForDataBase(word)
}