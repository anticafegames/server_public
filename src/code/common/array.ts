
export const deleteArrayItem = <T>(array: T[], first: (item: T) => boolean) => {

    const index = array.findIndex(first)
    return deleteArrayItemByIndex(array, index)
}

export const deleteArrayItemByIndex = <T>(array: T[], index: number) => {

    if(index != -1) {
        array.splice(index, 1)
    }

    return array as T[]
}

export const shuffle = (array: any[]) => {

	for(let i = array.length - 1; i > 0; i--) {

        const random = Math.floor(Math.random() * (i + 1))
        
		const temp = array[random]
		array[random] = array[i]
		array[i] = temp
    }
    
	return array;
}