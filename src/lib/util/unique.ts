export const unique = <T extends string | number>(items: T[]): T[] =>
    Array.from(new Set(items));

export const uniqueByKey = <T extends Record<string, unknown>>(
    items: T[],
    key: keyof T,
): T[] => [...new Map(items.map((item) => [item[key], item])).values()];
