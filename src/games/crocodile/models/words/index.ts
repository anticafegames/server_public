import { Schema, Types, model, SchemaTypeOptions, Document } from 'mongoose'
import { prepareWordForDataBase } from '../../../../code/common/game'

import helper from './helper'


export interface iCrocodileWord {
    level: number,
    text: string
}

export const CrocodileWordsSchema = new Schema({
    packId: {
        type: Schema.Types.ObjectId,
        unique: false,
        required: true
    },
    text: {
        type: String,
        unique: true,
        required: true,
        set: value => prepareWordForDataBase(value)
    }

}, { versionKey: false })


const schema = model<Document<iCrocodileWord>>('crocodilewords', CrocodileWordsSchema)

export default schema