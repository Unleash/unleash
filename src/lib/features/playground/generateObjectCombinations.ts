type Dict<T> = { [K in keyof T]: (string | number)[] };

export const splitByComma = <T extends Record<string, unknown>>(
    obj: T,
): Dict<T> => {
    return Object.entries(obj).reduce(
        (acc, [key, value]) => {
            if (key === 'properties' && typeof value === 'object') {
                const nested = splitByComma(value as any);
                return { ...acc, ...nested };
            } else if (typeof value === 'string') {
                return { ...acc, [key]: value.split(',') };
            } else {
                return { ...acc, [key]: [value] };
            }
        },
        {} as Dict<T>,
    );
};

export const generateCombinations = <T extends Record<string, unknown>>(
    obj: Dict<T>,
): T[] => {
    const keys = Object.keys(obj) as (keyof T)[];

    return keys.reduce(
        (results, key) =>
            results.flatMap((result) =>
                obj[key].map((value) => ({ ...result, [key]: value })),
            ),
        [{}] as Partial<T>[],
    ) as T[];
};

export const generateObjectCombinations = <T extends Record<string, any>>(
    obj: T,
): T[] => {
    const splitObj = splitByComma(obj);
    return generateCombinations(splitObj);
};
