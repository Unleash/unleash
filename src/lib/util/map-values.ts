export const mapValues = <T extends object, U>(
    object: T,
    fn: (value: T[keyof T]) => U,
): Record<keyof T, U> => {
    const entries = Object.entries(object).map(([key, value]) => [
        key,
        fn(value),
    ]);

    return Object.fromEntries(entries);
};
