import * as Kurento from 'kurento-client'
import MainSocket from '../../../sockets/main-socket'
import KurentoHelper from '../../../code/socket-helpers/webrtc/kurento-helper'
import { iUser } from '../../room/interface'
import { deleteArrayItem } from '../../../code/common/array'
import { iResult } from '../../../interfaces/common'


class Viewer {

    //Там мы во viewers
    presenterSocket: MainSocket
    presenterHelper: KurentoHelper

    //Там мы во viewing
    viewerSocket: MainSocket
    viewerHelper: KurentoHelper

    webRtcEndpoint: Kurento.WebRtcEndpoint

    candidatesQueueToServer: RTCIceCandidate[] = []

    answerIsSent: boolean

    constructor(presenter: MainSocket, viewer: MainSocket) {

        this.presenterSocket = presenter
        this.viewerSocket = viewer

        this.presenterHelper = presenter.webrtcSocket.kurentoHelper
        this.viewerHelper = viewer.webrtcSocket.kurentoHelper

        this.presenterHelper.viewers.push(this)
        this.viewerHelper.viewing.push(this)
    }

    get presenter() {
        return this.presenterSocket.webrtcSocket.kurentoHelper.presenter
    }

    startViewer = async (offer: string): Promise<iResult<any>> => {
        this.viewerSocket.debugLog('Внимание!!!!! Нужно тут сделать проверку, сконектился ли пресентер, если нет, то ждать этого, соответственно если фейл, то тут тоже фейл или ждать дальше, хз, по идее пресентер после реконнекта должен всемзапрос послать на подключение, хз, нужно тестить', 'Viewer startViewer')
        const promise = new Promise(async resolve => {

            const errorMessage = (message: string) => resolve({ type: 'answer', userId: this.presenterSocket.id, error: message })

            const { error, result } = await this.addViewer(offer)

            if (error) {
                this.stopViewer()
                return errorMessage(error)
            }

            const { answer } = result

            resolve({ type: 'answer', userId: this.presenterSocket.id, desc: this.viewerHelper.answerWrapper(answer) })
        })

        return promise
    }

    addViewer = (offer: any): Promise<iResult<any>> => {

        const promise = new Promise(async resolve => {

            try {

                this.webRtcEndpoint = await this.presenter.pipeline.create('WebRtcEndpoint')

                this.webRtcEndpoint.on('OnIceCandidate', (event) => {
                    const candidate = Kurento.getComplexType('IceCandidate')(event.candidate)
                    this.viewerSocket.emit('webrtc', { type: 'iceCandidate', desc: candidate, userId: this.presenterSocket.id })
                })

                this.webRtcEndpoint.on('IceComponentStateChange', (event) => {

                    if (event.state === 'CONNECTED') {
                        this.candidatesQueueToServer = []
                    }

                    if (event.state === 'FAILED') {
                        this.presenterSocket.warning('IceComponentStateChange = FAILED, reconnect viewer')
                        this.presenterHelper.reconnect('viewer', { type: 'reconnect', userId: this.viewerSocket.userId, desc: this })
                    }
                })

                const answer = await this.webRtcEndpoint.processOffer(offer.sdp)
                this.presenter.webRtcEndpoint.connect(this.webRtcEndpoint)

                this.answerIsSent = true
                while (this.candidatesQueueToServer.length) {
                    var candidate = this.candidatesQueueToServer.shift()
                    this.webRtcEndpoint.addIceCandidate(candidate)
                }

                this.webRtcEndpoint.gatherCandidates((error) => {
                    if (error) {
                        this.presenterSocket.error(error.description)
                    }
                })

                resolve({ result: { answer } })

            } catch (error) {
                resolve({ error })
            }
        })

        return promise
    }

    stopViewer = () => {

        if (this.webRtcEndpoint) {
            this.webRtcEndpoint.release()
        }

        deleteArrayItem(this.presenterHelper.viewers, this.findAction)
        deleteArrayItem(this.viewerHelper.viewing, this.findAction)
    }

    findAction = (item: Viewer) => item.presenterSocket.id === this.presenterSocket.id && item.viewerSocket.id === this.viewerSocket.id
}

export default Viewer
