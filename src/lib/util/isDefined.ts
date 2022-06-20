export const isDefined = <T>(value: T | null | undefined): value is T => {
    return value !== null && typeof value !== 'undefined';
};
