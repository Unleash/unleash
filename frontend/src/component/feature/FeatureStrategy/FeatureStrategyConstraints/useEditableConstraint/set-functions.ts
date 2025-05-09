// because Set.prototype.union and difference are baseline available 2024, but
// not available in GH actions yet. Caniuse also reports coverage at 87%. we can
// likely remove these in favor of the native implementations the next time we
// touch this code.
//
// todo: replace the use of this methods with set.union and set.difference when
// it's available.

export const union = <T>(a: Iterable<T>, b: Set<T>): Set<T> => {
    const result = new Set(a);
    for (const element of b) {
        result.add(element);
    }
    return result;
};

export const difference = <T>(a: Iterable<T>, b: Set<T>): Set<T> => {
    const result = new Set<T>();
    for (const element of a) {
        if (!b.has(element)) {
            result.add(element);
        }
    }
    return result;
};
