import { iGameUser, iGameUserResponce } from "./interface"

export const cloneGameUsersResponce = (users: iGameUser[]): iGameUserResponce[] => {

    return users.map(user => ({
        userId: user.user.id,
        vkId: user.user.vkId,
        name: user.name,
        nameFilled: user.nameFilled,
        userSeesName: user.userSeesName,
        ordernum: user.ordernum,
        whoMakesUp: user.whoMakesUp
    }))
}