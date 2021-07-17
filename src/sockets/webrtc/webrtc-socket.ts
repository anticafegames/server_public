import { v1 as uuidv1 } from 'uuid'
const kurento  = require('kurento-client')

import DefaultSocket from '../../code/socket/abstract-socket'

import { iSocketResultWebRtcData } from '../../interfaces/webrtc'
import { iRoom, iUser } from '../../entity/room/interface'
import Logger from '../../code/logger'
import MainSocket from '../main-socket'
import { iResult } from '../../interfaces/common'
import WebRTCHelper from '../../code/socket-helpers/webrtc/webrtc-helper'
import KurentoHelper from '../../code/socket-helpers/webrtc/kurento-helper'

export default class WebrtcSocket extends DefaultSocket {

    mainSocket: MainSocket

    webRTCHelper: WebRTCHelper
    kurentoHelper: KurentoHelper

    bindEvents = () => {
        this.socket.on('webrtc', this.kurentoWebrtcEvent)
    }

    initHelpers = () => {
        this.webRTCHelper = new WebRTCHelper(this)
        this.kurentoHelper = new KurentoHelper(this)
    }

    unbindEvents = () => {
        this.stopConnectionEvent()
        this.offAllEvents()
    }

    webrtcEvent = (data: iSocketResultWebRtcData) => {

        const { error, result } = this.webRTCHelper.canEmitWebrtcEvent(data)

        if (error) {
            return this.error(`Webrtc socket. Не возможно выполнить webrtc socket event error: ${error}`, 'webRTC socket webrtcEvent')
        }

        if (data.peerId !== undefined) {

            const recipient = this.getSocketById(data.peerId) as MainSocket

            data.userId = this.mainSocket.id
            recipient.emit("webrtc", data)

            this.log(`Webrtc ${data.type} to: ${data.peerId} from: ${data.userId}`, 'webRTC socket webrtcEvent')
        }
    }

    kurentoWebrtcEvent = (data: iSocketResultWebRtcData) => {
        this.webRTCHelper.kurentoWebrtcEvent(data)
    }

    stopConnectionEvent = () => {
        this.webRTCHelper.kurentoWebrtcEvent({ type: 'stop', userId: null, desc: null })
    }
}