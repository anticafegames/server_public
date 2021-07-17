import * as Kurento from 'kurento-client'
import KurentoHelper from '../../../code/socket-helpers/webrtc/kurento-helper'
import MainSocket from '../../../sockets/main-socket'
import { deleteArrayItem } from '../../../code/common/array'
import { iConnectionState } from '../../../interfaces/webrtc'
import { iResult } from '../../../interfaces/common'

class Presenter {

    mainSocket: MainSocket
    helper: KurentoHelper

    connectionState: iConnectionState = 'new'

    pipeline: Kurento.MediaPipeline
    webRtcEndpoint: Kurento.WebRtcEndpoint

    candidatesQueueToServer: RTCIceCandidate[] = []

    answerIsSent: boolean = false

    constructor(helper: KurentoHelper) {
        this.helper = helper
        this.mainSocket = helper.mainSocket
    }

    get viewers() {
        return this.helper.viewers
    }

    get kurentoClient() {
        return this.helper.kurentoClient
    }

    get socket() {
        return this.helper.socket
    }

    startPresenter = (offer: any): Promise<any> => {

        const userId = 'presenter'

        const promise = new Promise(async resolve => {

            try {

                const pipeline = await this.kurentoClient.create('MediaPipeline')
                const webRtcEndpoint = await pipeline.create('WebRtcEndpoint') as Kurento.WebRtcEndpoint

                this.pipeline = pipeline
                this.webRtcEndpoint = webRtcEndpoint

                webRtcEndpoint.on('OnIceCandidate', (event) => {

                    const candidate = Kurento.getComplexType('IceCandidate')(event.candidate)
                    this.socket.emit('webrtc', { type: 'iceCandidate', desc: candidate, userId })
                })

                webRtcEndpoint.on('MediaStateChanged', event => {

                    if (event.newState === 'CONNECTED') {
                        resolve({ result: true })
                    }
                })

                webRtcEndpoint.on('IceComponentStateChange', (event) => {

                    if (event.state === 'CONNECTED') { 
                        this.candidatesQueueToServer = []
                    }

                    if (event.state === 'FAILED') {
                        this.socket.warning('IceComponentStateChange = FAILED, reconnect presenter')
                        this.helper.reconnect('presenter', { type: 'reconnect', userId: 'presenter', desc: null })
                    }
                })

                const answer = await webRtcEndpoint.processOffer(offer.sdp)
                this.socket.emit('webrtc', { type: 'answer', desc: this.helper.answerWrapper(answer), userId })

                this.answerIsSent = true
                while (this.candidatesQueueToServer.length) {
                    var candidate = this.candidatesQueueToServer.shift();
                    webRtcEndpoint.addIceCandidate(candidate);
                }

                webRtcEndpoint.gatherCandidates((error) => {
                    if (error) {
                        this.socket.error(error.description)
                    }
                })

            } catch (error) {
                resolve({ type: 'answer', userId, error })
            }

        })

        return promise
    }

    stopPresenter = () => {

        if (this.viewers) {

            this.viewers.forEach(viewer => {
                if (viewer.webRtcEndpoint) {
                    viewer.webRtcEndpoint.release()
                }

                let viewing = viewer.viewerHelper.viewing
                deleteArrayItem(viewing, item => item.presenterSocket.id === viewer.presenterSocket.id)
            })
        }

        this.helper.viewers = []

        if (!this.webRtcEndpoint) {
            this.webRtcEndpoint.release()
        }
        
        this.helper.presenter = null
    }
}

export default Presenter