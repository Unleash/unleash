export const unknownify = (value?: string) =>
    !value || value === 'undefined' ? 'unknown' : value;
