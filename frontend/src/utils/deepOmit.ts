export type DeepOmit<T, K extends keyof any> =
    T extends Record<string, any>
        ? { [P in Exclude<keyof T, K>]: DeepOmit<T[P], K> }
        : T;

export function deepOmit<T, K extends keyof any>(
    obj: T,
    ...keysToOmit: K[]
): DeepOmit<T, K> {
    const omitSet = new Set(keysToOmit);

    if (Array.isArray(obj)) {
        return obj.map((item) =>
            deepOmit(item, ...keysToOmit),
        ) as unknown as DeepOmit<T, K>;
    } else if (typeof obj === 'object' && obj !== null) {
        const result: Partial<DeepOmit<T, K>> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (!omitSet.has(key as K)) {
                result[key as Exclude<keyof T, K>] = deepOmit(
                    value,
                    ...keysToOmit,
                );
            }
        }
        return result as DeepOmit<T, K>;
    }
    return obj as DeepOmit<T, K>;
}
