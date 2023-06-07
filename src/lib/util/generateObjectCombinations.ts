type Dict<T> = { [K in keyof T]: string[] };

export function splitByComma<T extends Record<string, string>>(
    obj: T,
): Dict<T> {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value.split(',')]),
    ) as Dict<T>;
}

export function generateCombinations<T extends Record<string, string>>(
    obj: Dict<T>,
): T[] {
    const keys = Object.keys(obj) as (keyof T)[];

    return keys.reduce(
        (results, key) =>
            results.flatMap((result) =>
                obj[key].map((value) => ({ ...result, [key]: value })),
            ),
        [{}] as Partial<T>[],
    ) as T[];
}

export function generateObjectCombinations<T extends Record<string, string>>(
    obj: T,
): T[] {
    const splitObj = splitByComma(obj);
    return generateCombinations(splitObj);
}
