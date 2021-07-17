import * as Kurento from 'kurento-client'
import { iUser } from '../entity/room/interface'

export interface iSocketResultWebRtcData {
    type: 'presenter' | 'viewer' | 'stop' | 'iceCandidate' | 'reconnect',
    peerId?: string,
    desc: any,
    userId?: string 
}

export type iConnectionState = 'new' | 'connecting' | 'connected' | 'failed' | 'disconnected'