import mongoose = require('mongoose')

import { iResult } from "../interfaces/common"

type ActionMongoose<T> = () => Promise<T>

const connect = <T>(action: ActionMongoose<T>, database?: string) => {

    return new Promise<iResult<T>>(async (resolve, reject) => {

        try {
            await mongoose.connect(`mongodb://localhost/${database || 'Anticafe'}`, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, poolSize: 5 })

            const result = await action()
            resolve({ error: null, result })

        } catch (error) {
            resolve({ error })
        }
    })
}

export default connect