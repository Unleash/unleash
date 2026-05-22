const mask = (s: string) => '*'.repeat(s.length);

const MAX_CACHE = 300;
const cache = new Map<string, string>();

const setCached = (url: string, result: string): string => {
    if (cache.size >= MAX_CACHE) {
        cache.delete(cache.keys().next().value!);
    }
    cache.set(url, result);
    return result;
};

export const scrubUrl = (url: string): string => {
    const cached = cache.get(url);
    if (cached !== undefined) return cached;

    // Collapse double slashes in path (e.g. /projects//features//copy) to avoid
    // a browser URL constructor warning. Use a lookbehind to preserve :// in absolute URLs.
    const parsed = new URL(url.replace(/(?<!:)\/\//g, '/'), 'http://x');

    const isAbsolute = /^https?:\/\//i.test(url);
    const origin = isAbsolute ? `${parsed.protocol}//${parsed.host}` : '';

    const segments = parsed.pathname.split('/').filter(Boolean);
    const scrubbedPath = segments.map((segment, i) =>
        i < 3 ? segment : mask(segment),
    );
    const path = scrubbedPath.length > 0 ? `/${scrubbedPath.join('/')}` : '/';

    if (!parsed.search) return setCached(url, `${origin}${path}`);

    const params = new URLSearchParams(parsed.search);
    const scrubbed = new URLSearchParams(
        [...params].map(([k, v]) => [k, mask(v)]),
    );
    return setCached(url, `${origin}${path}?${scrubbed.toString()}`);
};
