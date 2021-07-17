import { Schema, Types, model, SchemaTypeOptions, Document } from 'mongoose'
import { prepareWordForDataBase } from '../../../../code/common/game'

export interface iTeamNames {
    _id: string,
    name: string
}

export const TeamNamesSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    text: {
        type: String,
        unique: true,
        required: true
    }

}, { versionKey: false })

const schema = model<Document<iTeamNames>>('teamnames', TeamNamesSchema)

export default schema