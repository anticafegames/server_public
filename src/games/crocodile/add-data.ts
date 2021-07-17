import { iResult } from '../../interfaces/common'
import { PacksSchema } from './models/packs'
import PacksHelper from './models/packs/helper'
import WordsHelper from './models/words/helper'

const addData = async (data): Promise<iResult<any>> => {

    if(!data || !data.words || !data.words.length) return { result: true }

    const pack: string = data.pack
    const words: string[] = data.words

    const { error } = await WordsHelper.addWords(pack, words)

    if(error) {
        return { error }
    }

    return { result: true }
}

const loadPreviewData = async (): Promise<iResult<any>> => {

    const { error, result } = await PacksHelper.findAll()

    if(error) {
        return { error }
    }

    const data = result.map(pack => ({ text: pack.get('name'), value: pack._id }))

    return { result: data }
}

export default { addData, loadPreviewData }