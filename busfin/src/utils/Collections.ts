export function toDictionary<T,VKey>(array: T[], keyFunc: (item:T) => VKey) {
    const dict = new Map<VKey, T>();
    for (let i = 0; i < array.length; i++) {
         const key = keyFunc(array[i])
         dict.set(key, array[i])
    }
    return dict;
}

export function removeFromArray<T>(item:T, fromArray:T[]): T[] {
    const index = fromArray.indexOf(item);
    if (index >= 0) {
        let empty:T[] = []
        return empty.concat(fromArray).splice(index, 1);
    }
    return fromArray;
}