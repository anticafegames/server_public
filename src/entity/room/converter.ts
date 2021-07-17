import { iRoom, iResponceRoom, iUser, iResponceUser, iResponceShortRoom } from "./interface"
import Room from "."

export const cloneRoom = (room: Room, ignoreUsersId: string[] = []) => <iResponceRoom> {
    id: room.id,
    status: room.status,
    openRoom: room.openRoom,
    users: cloneUsers(room.users, ignoreUsersId),
    ownerId: room.ownerId,
    maxUsers: room.maxUsers,
    debugParams: room.debugRoomParams
}

export const cloneShortRoom = (room: Room) => {

    const owner = room.findUserById(room.ownerId)

    const shortRoom: iResponceShortRoom = {
        id: room.id,
        status: room.status,
        openRoom: room.openRoom,
        usersLength: room.users.length,
        owner: owner && cloneUser(owner),
        maxUsers: room.maxUsers
    }

    return shortRoom
}

export const cloneUsers = (users: iUser[], ignoreUsersId: string[] = []) => users.filter(user => !ignoreUsersId.includes(user.id)).map(user => cloneUser(user))
export const cloneUser = (user: iUser) => <iResponceUser>{
    id: user.id,
    vkId: user.vkId
}