const isDefined = <T>(entry: [string, T | undefined]): entry is [string, T] =>
    entry[1] !== undefined;

export const omitUndefined = <T>(
    object: Record<string, T | undefined>,
): Record<string, T> =>
    Object.fromEntries(Object.entries(object).filter(isDefined));
