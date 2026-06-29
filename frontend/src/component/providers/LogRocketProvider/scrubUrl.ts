const mask = (s: string) => '*'.repeat(s.length);

const MAX_CACHE = 300;
const cache = new Map<string, string>();

const setCached = (key: string, result: string): string => {
    if (cache.size >= MAX_CACHE) {
        cache.delete(cache.keys().next().value!);
    }
    cache.set(key, result);
    return result;
};

const ABSOLUTE_URL_RE = /^https?:\/\//i;

export const scrubUrl = (url: string, depth = 3): string => {
    const cacheKey = `${depth}:${url}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) return cached;

    const parsed = new URL(url, 'http://x');

    const isAbsolute = ABSOLUTE_URL_RE.test(url);
    const origin = isAbsolute ? `${parsed.protocol}//${parsed.host}` : '';

    const segments = parsed.pathname.split('/').filter(Boolean);
    const scrubbedPath = segments.map((segment, i) =>
        i < depth ? segment : mask(segment),
    );
    const path = scrubbedPath.length > 0 ? `/${scrubbedPath.join('/')}` : '/';

    if (!parsed.search) return setCached(cacheKey, `${origin}${path}`);

    const params = new URLSearchParams(parsed.search);
    const scrubbedParams = new URLSearchParams(
        [...params].map(([k, v]) => [k, mask(v)]),
    );
    return setCached(cacheKey, `${origin}${path}?${scrubbedParams.toString()}`);
};

const STATIC_ASSET_EXT_RE =
    /\.(?:css|js|mjs|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|eot|avif|mp4|webm)(?:[?#]|$)/i;

const STATIC_PATH_RE = /(?:^|\/)static\//i;

const FONT_SERVICE_DOMAINS = new Set([
    'fonts.googleapis.com',
    'fonts.gstatic.com',
]);

export const isStaticAsset = (url: string): boolean => {
    if (STATIC_ASSET_EXT_RE.test(url)) return true;
    const parsed = new URL(url, 'http://x');
    return (
        FONT_SERVICE_DOMAINS.has(parsed.hostname) ||
        STATIC_PATH_RE.test(parsed.pathname)
    );
};

export const scrubBrowserUrl = (url: string): string => scrubUrl(url, 2);
