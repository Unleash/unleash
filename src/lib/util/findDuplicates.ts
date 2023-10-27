export const findDuplicates = <T>(arr: T[]): T[] => {
    const seen: Set<T> = new Set();
    const duplicates: Set<T> = new Set();

    for (const item of arr) {
        if (seen.has(item)) {
            duplicates.add(item);
        } else {
            seen.add(item);
        }
    }

    return [...duplicates];
};
