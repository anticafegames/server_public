import Schema, { TeamNamesSchema, iTeamNames } from '.'
import { randomNumber } from '../../../../code/common'
import { prepareWordForDataBase } from '../../../../code/common/game'
import connect from '../../../../code/mongo-connect'
import { iResult } from '../../../../interfaces/common'

export default class TeamNamesHelper {

    static findAll() {
        return connect(async () => {
            return Schema.find()
        })
    }

    static randomTeams(count: number, selectedTeams: string[] = []) {

        return connect(async () => {

            const countTeams = await Schema.count()
            let newTeams: string[] = []

            for (let i = 1; i <= count; i++) {

                const randomWordIndex = randomNumber(0, countTeams - 1)

                const result = await Schema.find()
                    .skip(randomWordIndex)
                    .limit(1)
                    .select('text')
                    .exec()

                const team = result[0].get('text') as string
                
                if (selectedTeams.includes(team) || newTeams.includes(team)) {
                    i--
                    continue
                }

                newTeams.push(team)
            }

            return newTeams
        })
    }
}