import express = require('express')
const fs = require('fs')

import './init-dependency-injection'

import initServer from './init-server'
import initMiddleware from './init-middleware'
import initRoutes from './init-routes'
import { initVkPassport } from './init-vk-passport'
import initSocket from './init-socket'

const app = express()
const server = initServer(app)

initMiddleware(app)
initRoutes(app)
initVkPassport(app)
initSocket(server)

server.listen(443)