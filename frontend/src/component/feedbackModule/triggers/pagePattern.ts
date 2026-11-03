export const isValidPagePattern = (pattern: string): boolean => {
    if (!pattern.startsWith('/')) {
        return false;
    }
    try {
        new URLPattern({ pathname: pattern });
        return true;
    } catch {
        return false;
    }
};
