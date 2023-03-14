export const unique = <T extends string | number>(items: T[]): T[] =>
    Array.from(new Set(items));
