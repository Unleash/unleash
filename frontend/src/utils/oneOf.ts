export const oneOf = (values: string[], match: string) => {
    return values.some(value => value === match);
};
