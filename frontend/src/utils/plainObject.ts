export const isPlainObject = (
    value: unknown,
): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseJsonObject = (
    json: string,
): Record<string, unknown> | undefined => {
    try {
        const value: unknown = JSON.parse(json);
        return isPlainObject(value) ? value : undefined;
    } catch {
        return undefined;
    }
};
