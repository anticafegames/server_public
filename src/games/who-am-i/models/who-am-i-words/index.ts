import { Schema, Types, model, SchemaTypeOptions, Document } from 'mongoose'
import { prepareWordForDataBase } from '../../../../code/common/game'

import helper from './helper'


export interface iWhoAmIWord {
    level: number,
    text: string
}

export const WhoAmISchema = new Schema({
    level: {
        type: Number,
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


const schema = model<Document<iWhoAmIWord>>('whoamiwords', WhoAmISchema)

export default schema