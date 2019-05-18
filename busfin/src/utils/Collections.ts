export function toDictionary<T>(array: T[], keyFunc: (item:T) => string) {
    const normalizedObject: { [key:string]: T} = {}
    for (let i = 0; i < array.length; i++) {
         const key = keyFunc(array[i])
         normalizedObject[key] = array[i]
    }

    return normalizedObject;
}

export function removeFromArray<T>(item:T, fromArray:T[]): T[] {
    const index = fromArray.indexOf(item);
    if (index >= 0) {
        return fromArray.splice(index, 1);
    }
    return fromArray;
}