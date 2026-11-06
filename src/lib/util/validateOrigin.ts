/**
 * An origin may contain one `*` inside a host label, for example
 * `https://deploy-preview-*--my-site.netlify.app`, to allow hosts with a
 * dynamic part (deploy previews, review apps) without allowing every origin.
 * The `*` matches letters, digits and hyphens, never a dot. A label has at most
 * one `*`, with literal text on both sides, and the last two labels have none,
 * so `https://*.example.com` and `https://app-*.example.com` stay invalid.
 */
const WILDCARD_SAMPLE = 'wildcardsample';

export const isWildcardOrigin = (origin: string): boolean =>
    origin !== '*' && origin.includes('*');

const validateWildcardOrigin = (origin: string): boolean => {
    const sample = origin.replaceAll('*', WILDCARD_SAMPLE);
    let parsed: URL;
    try {
        parsed = new URL(sample);
    } catch {
        return false;
    }
    if (parsed.origin !== sample) {
        return false;
    }

    const labels = parsed.hostname.split('.');
    const hostWildcards = labels.join('.').split(WILDCARD_SAMPLE).length - 1;
    if (hostWildcards !== origin.split('*').length - 1) {
        return false;
    }

    return labels.every((label, index) => {
        const parts = label.split(WILDCARD_SAMPLE);
        if (parts.length === 1) {
            return true;
        }
        const isRegistrableLabel = index >= labels.length - 2;
        const [before, after] = parts;
        return (
            !isRegistrableLabel &&
            parts.length === 2 &&
            before !== '' &&
            after !== ''
        );
    });
};

export const validateOrigin = (origin: string | undefined): boolean => {
    if (origin === undefined) {
        return false;
    }
    if (origin === '*') {
        return true;
    }

    if (origin.includes('*')) {
        return validateWildcardOrigin(origin);
    }

    try {
        const parsed = new URL(origin);
        return typeof parsed.origin === 'string' && parsed.origin === origin;
    } catch {
        return false;
    }
};

export const validateOrigins = (origins: string[]): string | undefined => {
    for (const origin of origins) {
        if (!validateOrigin(origin)) {
            return `Invalid origin: ${origin}`;
        }
    }
};
