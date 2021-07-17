import * as core from "express-serve-static-core";
import UserHelper from './models/User/user-helper'
import Logger from "./code/logger";

const initRoutes = (app: core.Express) => {

    app.get('/hello', (req, res, next) => {
        res.json({message: 'hello restart2'})
    })

    app.get('/api/protected/user-list', async (req, res, next) => {

        const data = await UserHelper.findAllUsers()
        res.json(data)
    })

    app.post('/registration', async (req, res) => {
        const { email, firstname, lastname, password } = req.body
        const data = await UserHelper.createUser(email, firstname, lastname, password)
        res.send(data)
    })

    app.delete('/api/protected/user', async (req, res) => {
        const { userId } = req.body;
        const data = await UserHelper.deleteUser(userId)
        res.send(data)
    })

    app.post('/api/protected/user/profile-photo', (req, res) => {
        Logger.info('files', 'route', { files: req.files })
        res.send(req.files)
    })
}

export default initRoutes