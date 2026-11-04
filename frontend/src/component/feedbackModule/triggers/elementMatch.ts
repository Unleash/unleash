export type ElementMatch =
    | { selector: string; text?: string }
    | { text: string };

export const isValidSelector = (selector: string): boolean => {
    try {
        document.createDocumentFragment().querySelector(selector);
        return true;
    } catch {
        return false;
    }
};

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

export const parseElementMatch = (
    raw: Record<string, unknown>,
): ElementMatch | null => {
    const { selector, text } = raw;
    if (text !== undefined && !isNonEmptyString(text)) {
        return null;
    }
    if (selector === undefined) {
        return text === undefined ? null : { text };
    }
    if (typeof selector !== 'string' || !isValidSelector(selector)) {
        return null;
    }
    return text === undefined ? { selector } : { selector, text };
};
