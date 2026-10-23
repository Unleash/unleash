const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Compares keys by UTF-16 code unit so the ordering is identical on every
 * machine and locale. That matters here: the output is used to diff two
 * payloads, so the order must not depend on the browser's locale.
 */
const compareKeys = (a: string, b: string): number => {
    if (a < b) {
        return -1;
    }

    return a > b ? 1 : 0;
};

/**
 * Recursively sorts object keys alphabetically, leaving array order untouched.
 * Produces a canonical shape so two payloads that differ only in key order
 * compare equal when diffed.
 */
export const sortJsonKeys = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        return value.map(sortJsonKeys);
    }

    if (isPlainObject(value)) {
        // Object.fromEntries defines own properties instead of assigning them,
        // so a literal `__proto__` key is preserved rather than mutating the
        // prototype and disappearing from the serialized output.
        return Object.fromEntries(
            Object.keys(value)
                .sort(compareKeys)
                .map((key) => [key, sortJsonKeys(value[key])]),
        );
    }

    return value;
};
