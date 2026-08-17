const MAX_POOL_SIZE = 1000;

export const createFlagFieldInterner = () => {
    const pool = new Map<string, string>();
    return (value: string): string => {
        const existing = pool.get(value);
        if (existing !== undefined) {
            return existing;
        }
        if (pool.size < MAX_POOL_SIZE) {
            pool.set(value, value);
        }
        return value;
    };
};

export const internFlagField = createFlagFieldInterner();
