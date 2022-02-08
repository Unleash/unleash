// Remove fields from an object if their value is the empty string.
export const removeEmptyStringFields = (object: {
    [key: string]: unknown;
}): { [key: string]: unknown } => {
    const entries = Object.entries(object);
    const filtered = entries.filter(([, v]) => v !== '');

    return Object.fromEntries(filtered);
};
