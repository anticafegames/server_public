import Schema, { PacksSchema, iPack } from '.'
import { randomNumber } from '../../../../code/common'
import { prepareWordForDataBase } from '../../../../code/common/game'
import connect from '../../../../code/mongo-connect'
import { iResult } from '../../../../interfaces/common'

export default class PacksHelper {

    static findAll() {
        return connect(async () => {
            return Schema.find()
        })
    }

    static loadDefaultPack() {
        return connect(async () => {
            return Schema.findOne({ defaultPack: true })
        })
    }

    static async isExistById(id: string) {
        
        const { error, result } = await connect(async () => {
            return await !!Schema.exists({ id })
        })

        return !error && result
    }
}