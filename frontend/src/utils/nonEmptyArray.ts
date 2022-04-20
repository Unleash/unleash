export const nonEmptyArray = (value: unknown): boolean => {
    return Boolean(value) && Array.isArray(value) && value.length > 0;
};
