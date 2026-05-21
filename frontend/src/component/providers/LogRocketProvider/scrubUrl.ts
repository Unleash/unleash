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

    const { pathname, search } = new URL(url, 'http://x');

    const segments = pathname.split('/').filter(Boolean);
    const scrubbedPath = segments.map((segment, i) =>
        i < 3 ? segment : mask(segment),
    );
    const path = scrubbedPath.length > 0 ? `/${scrubbedPath.join('/')}` : '/';

    if (!search) return setCached(url, path);

    const params = new URLSearchParams(search);
    const scrubbed = new URLSearchParams(
        [...params].map(([k, v]) => [k, mask(v)]),
    );
    return setCached(url, `${path}?${scrubbed.toString()}`);
};
