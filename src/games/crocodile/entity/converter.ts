import { iGameTeam, iGameUser, iHostTeam, iGameUserResponce, iGameTeamResponce, iHostTeamResponce } from './interface'

export const cloneGameTeamsResponce = (teams: iGameTeam[]): iGameTeamResponce[] => {
    return teams.map(team => ({
        name: team.name,
        users: cloneGameUsersResponce(team.users)
    }))
}

export const cloneGameUsersResponce = (users: iGameUser[]): iGameUserResponce[] => {
    return users.map(user => ({
        userId: user.user.id,
        vkId: user.user.vkId
    }))
}

export const cloneHostTeamResponce = (hostTeam: iHostTeam): iHostTeamResponce => ({
    teamId: hostTeam.teamId,
    hostUserId: hostTeam.hostUserId
})