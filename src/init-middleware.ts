import * as core from "express-serve-static-core";
import bodyParser = require('body-parser')
import fileUpload = require('express-fileupload')
import cors = require('cors')

import { verifyToken } from './init-passport'

const initMiddleware = (app: core.Express) => {

    app.use(bodyParser.json());

    app.use('*', cors({ 
        allowedHeaders: ['authorization', 'content-type', 'accept'], 
        methods: 'OPTIONS, POST, GET',
        maxAge: 2592000,
        origin: true
    }))

    app.use(fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
        useTempFiles : true,
        tempFileDir : './static/tmp/'
    }));

    app.all('/api/*', verifyToken)
} 

export default initMiddleware