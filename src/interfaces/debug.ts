export type iLogType = 'info' | 'warning' | 'error' | 'socket' | 'debug'

export interface iLog {
    type: iLogType,
    userId: string,
    message: string,
    path?: string,
    data?: any
}