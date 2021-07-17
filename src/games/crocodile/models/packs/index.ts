import { Schema, Types, model, SchemaTypeOptions, Document } from 'mongoose'
import { prepareWordForDataBase } from '../../../../code/common/game'

export interface iPack {
    _id: string,
    name: string,
    defaultPack?: boolean
}

export const PacksSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    defaultPack: {
        type: Schema.Types.Boolean,
        required: false
    }

}, { versionKey: false })

const schema = model<Document<iPack>>('crocodilepacks', PacksSchema)

export default schema