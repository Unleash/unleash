const pool = new Map<string, string>();

export const internString = (value: string): string => {
    const existing = pool.get(value);
    if (existing !== undefined) {
        return existing;
    }
    pool.set(value, value);
    return value;
};
