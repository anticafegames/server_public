import Shema, { CrocodileWordsSchema } from '.'
import connect from '../../code/mongo-connect'

export default class CrocodileWordsHelper {

    static findBylevel(level: number) {
        return connect(async () => {
            return Shema.findOne({ level: { $eq: level } })
        })
    }

    static findAll() {
        return connect(async () => {
            return Shema.find()
        })
    }

    static createNewLevel(level) {
        return connect(async () => {
            new Shema({ level: level, words: [] }).save()
        })
    }

    static addWords(level, words) {
        return connect(async () => {
            return Shema.updateOne({ level: { $eq: level } }, { $push: { words: words } })
        })
    }
}