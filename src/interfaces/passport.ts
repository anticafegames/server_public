type iTokenTipe = 'access_token' | 'refresh_token'
export type iAppKey = 'web' | 'vk-app' | 'vk-game' | 'mobile'

interface iUserForAccessToken {
    id: string
    email: string
    firstname: string
    lastname: string
    userPhotoId?: string
}

interface iUserForRefreshToken {
    id: string
}

export interface iAcessToken {
    user: iUserForAccessToken
    token_type: iTokenTipe
}

export interface iRefreshToken {
    user: iUserForRefreshToken
    token_type: iTokenTipe
}

export interface iVkSession {
    expire: number
    mid: number
    secret: string
    sid: string
    sig: string
}

export interface iVkAuth {
    access_token: string,
    expires_in: number,
    user_id: number
    appKey: iAppKey
}

export interface iAuthResult {
    access_token: string,
    user_id: number,
    anticafe_token: string
    appKey: iAppKey
    isAdmin: boolean
    isDeveloper: Boolean
}