import { iResult } from '../../interfaces/common'
import WhoAmIModelWords from './models/who-am-i-words/helper'

const addData = async (data: string[]): Promise<iResult<any>> => {

    if(!data || !data.length) return { result: true }
    
    const { error } =  await WhoAmIModelWords.addWords(1, data)

    if(error) {
        return { error }
    }

    return { result: true }
}

export default { addData }