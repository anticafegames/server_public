
export type iResult<T> = {
    error?: string | any,
    result?: T
}

export interface iError {
    code: number
    message: string
}

export type iEntityMode = 'full' | 'responce' | 'responce-short'