import mongoose = require('mongoose')

export const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    firstname: {
        type: String,
        require: true,
    },
    lastname: {
        type: String,
        require: true,
    },
    userPhotoId: {
        type: String,
        unique: true,
    }
}, { versionKey: false })

export interface iUser {
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    userPhotoId?: string
}

export default mongoose.model('User', UserSchema)