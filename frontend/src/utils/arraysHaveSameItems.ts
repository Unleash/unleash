export const arraysHaveSameItems = <T>(a: T[], b: T[]): boolean => {
    const setA = new Set(a);
    const setB = new Set(b);

    if (setA.size !== setB.size) {
        return false;
    }

    return [...setA].every(itemA => {
        return setB.has(itemA);
    });
};
