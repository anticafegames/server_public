import * as core from "express-serve-static-core"
import https = require('https')
import http = require('http')
import * as fs from 'fs'
import path = require('path')

import { isLocalhost, isHttp } from './code/env'


const initServer = (app: core.Express) => {

    if (!isHttp) {

        const dir = isLocalhost ? `${__dirname}/crypt` : path.normalize(`${__dirname}/../private-keys`)
        const prefix = isLocalhost ? '-localhost' : ''

        const options: https.ServerOptions = {
            key: fs.readFileSync(`${dir}/private${prefix}.key`),
            cert: fs.readFileSync(`${dir}/certificate${prefix}.crt`),
            requestCert: false,
            rejectUnauthorized: false
        }

        if (!isLocalhost) {
            options.ca = fs.readFileSync(`${dir}/certificate_ca.crt`)
        }

        console.log('init https')
        return https.createServer(options, app)

    } else {
        console.log('init http')
        return new http.Server(app)
    }
}

export default initServer