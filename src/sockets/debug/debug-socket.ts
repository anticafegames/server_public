import { v1 as uuidv1 } from 'uuid'

import DefaultSocket from '../../code/socket/abstract-socket'

import { iSocketResultWebRtcData } from '../../interfaces/webrtc'
import { iRoom, iUser } from '../../entity/room/interface'
import Logger from '../../code/logger'
import AuthHelper from '../../code/socket-helpers/auth/auth-helper'
import DebugHelper from '../../code/socket-helpers/debug/debug-helper'
import MainSocket from '../main-socket'
import { iVkSession } from '../../interfaces/passport'

export default class DebugSocket extends DefaultSocket {

    authHelper: AuthHelper
    debugHelper: DebugHelper

    mainSocket: MainSocket

    eventPrefix = 'debug'

    bindEvents = () => {
        this.authHelper = this.mainSocket.authHelper
        this.on('listen-logs', this.addLogsListener)
        this.on('unbind-listen-logs', this.removeLogListener)
    }

    unbindEvents = () => {
        this.removeLogListener()
        this.offAllEvents()
    }

    initHelpers = () => {
        this.debugHelper = new DebugHelper(this)
    }

    addLogsListener = () => {

        if (this.mainSocket.authHelper.checkDeveloper()) {
            this.server.logHelper.addLogListener(this.mainSocket)
        }
    }
    removeLogListener = () => this.server.logHelper.removeLogListener(this.userId)
}