import { Schema, Types, model, SchemaTypeOptions } from 'mongoose'

export const CrocodileWordsSchema = new Schema({
    level: {
        type: Number,
        unique: true,
        required: true
    },
    words: {
        type: [String],
        unique: true,
        required: true
    }

}, { versionKey: false })

export interface iCrocodileWords {
    level: number,
    words: string[]
}

export default model('CrocodileWords', CrocodileWordsSchema)