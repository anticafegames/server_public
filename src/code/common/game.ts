export const prepareWordForDataBase = (word: string) => {

    if(!word) return ""

    let words = word.split(/ +/)
                        
    words = words.map(text => {

        if(text.length == 1) {
            return text.toUpperCase()
        }

        return text[0].toUpperCase() + text.substring(1).toLowerCase()
    })

    return words.join(' ')
}