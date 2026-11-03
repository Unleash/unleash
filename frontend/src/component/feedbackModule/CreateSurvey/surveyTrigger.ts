// Older browsers lack URLPattern; they can still save a pattern, just not check it.
export const canMatchPages = (): boolean => typeof URLPattern !== 'undefined';

const toPagePattern = (page: string): URLPattern | null => {
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

export const validatePage = (page: string): string | undefined => {
    const trimmedPage = page.trim();
    if (trimmedPage === '') {
        return undefined;
    }
    if (!trimmedPage.startsWith('/')) {
        return 'Start the pattern with /, for example /projects/:projectId';
    }
    return !canMatchPages() || isValidPagePattern(trimmedPage)
        ? undefined
        : 'This is not a valid page pattern';
};

export type PageMatch =
    | 'match'
    | 'match-every-page'
    | 'no-match'
    | 'invalid-pattern'
    | 'invalid-url';

const toPathname = (url: string): string | null => {
    try {
        // new URL needs a base to parse a bare path; only the pathname is read, so the base's domain doesn't matter.
        return url.startsWith('/')
            ? new URL(url, 'https://example.com').pathname
            : new URL(url).pathname;
    } catch {
        return null;
    }
};

export const matchPage = (page: string, url: string): PageMatch => {
    const pathname = toPathname(url.trim());
    if (pathname === null) {
        return 'invalid-url';
    }
    const trimmedPage = page.trim();
    if (trimmedPage === '') {
        return 'match-every-page';
    }
    const pattern = toPagePattern(trimmedPage);
    if (pattern === null) {
        return 'invalid-pattern';
    }
    return pattern.test({ pathname }) ? 'match' : 'no-match';
};
