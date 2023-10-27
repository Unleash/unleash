export type DeepOmit<T, K extends keyof any> = T extends Record<string, any>
    ? { [P in Exclude<keyof T, K>]: DeepOmit<T[P], K> }
    : T;

export function deepOmit<T, K extends keyof any>(
    obj: T,
    keyToOmit: K,
): DeepOmit<T, K> {
    if (Array.isArray(obj)) {
        return obj.map((item) =>
            deepOmit(item, keyToOmit),
        ) as unknown as DeepOmit<T, K>;
    } else if (typeof obj === 'object' && obj !== null) {
        const result: Partial<DeepOmit<T, K>> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key !== keyToOmit) {
                result[key as Exclude<keyof T, K>] = deepOmit(value, keyToOmit);
            }
        }
        return result as DeepOmit<T, K>;
    }
    return obj as DeepOmit<T, K>;
}
