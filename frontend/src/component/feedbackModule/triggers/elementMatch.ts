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

const normalizeText = (text: string): string =>
    text.replace(/\s+/g, ' ').trim();

const isMatchableText = (value: unknown): value is string =>
    typeof value === 'string' && normalizeText(value).length > 0;

export const parseElementMatch = (
    raw: Record<string, unknown>,
): ElementMatch | null => {
    const { selector, text } = raw;
    if (text !== undefined && !isMatchableText(text)) {
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

/**
 * Collects the element and its ancestors, nearest first, stopping below
 * `<body>`. Returns an empty list when the element is not attached under
 * `<body>`, so `<body>`, `<html>` and detached nodes never become candidates.
 *
 * Given `<body><main><button><span>Create</span></button></main></body>`,
 * the span yields `[span, button, main]`.
 */
const ancestorsAndSelfWithinBody = (element: Element): Element[] => {
    const body = element.ownerDocument.body;
    if (!body.contains(element)) {
        return [];
    }
    const elements: Element[] = [];
    for (
        let current: Element | null = element;
        current !== null && current !== body;
        current = current.parentElement
    ) {
        elements.push(current);
    }
    return elements;
};

const matchesSelector = (match: ElementMatch, element: Element): boolean =>
    !('selector' in match) || element.matches(match.selector);

export const matchesElement = (
    match: ElementMatch,
    target: Element,
): boolean => {
    const candidates = ancestorsAndSelfWithinBody(target);
    if (match.text === undefined) {
        return candidates.some((element) => matchesSelector(match, element));
    }
    const expectedText = normalizeText(match.text);
    for (const element of candidates) {
        const elementText = normalizeText(element.textContent ?? '');
        // Each parent has at least as much text as its child, so once the
        // text gets too long it will not match for any parent either.
        // Stopping here avoids reading textContent of large ancestors on
        // every click.
        const remainingCandidatesTooLong =
            elementText.length > expectedText.length;
        if (remainingCandidatesTooLong) {
            return false;
        }
        if (elementText === expectedText && matchesSelector(match, element)) {
            return true;
        }
    }
    return false;
};
