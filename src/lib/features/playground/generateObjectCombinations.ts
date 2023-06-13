type Dict<T> = { [K in keyof T]: string[] };

export const splitByComma = <T extends Record<string, string>>(
    obj: T,
): Dict<T> =>
    Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value.split(',')]),
    ) as Dict<T>;

export const generateCombinations = <T extends Record<string, any>>(
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
