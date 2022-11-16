// creates a fn returning fallback value
export const withFallback =
    (useFallback: boolean) =>
    <T extends any[], U>(fn: (...args: T) => U, fallback: U) => {
        return (...args: T) => {
            if (useFallback) {
                return fallback;
            }
            return fn(...args);
        };
    };
