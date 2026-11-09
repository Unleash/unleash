// Older browsers lack URLPattern; they can still save a pattern, just not check it.
export const canMatchPages = (): boolean => typeof URLPattern !== 'undefined';

export const toPagePattern = (page: string): URLPattern | null => {
    if (!page.startsWith('/')) {
        return null;
    }
    try {
        return new URLPattern({ pathname: page });
    } catch {
        return null;
    }
};

export const isValidPagePattern = (pattern: string): boolean =>
    toPagePattern(pattern) !== null;
