export const formatApiPath = (path: string, base = basePath): string => {
    return joinPaths(base, path);
};

export const formatAssetPath = (path: string, base = basePath): string => {
    if (import.meta.env.DEV && import.meta.env.BASE_URL !== '/') {
        // Vite will automatically add BASE_URL to imported assets.
        return joinPaths(path);
    }

    return joinPaths(base, path);
};

// Parse the basePath value from the HTML meta tag.
export const parseBasePath = (value = basePathMetaTagContent()): string => {
    if (import.meta.env.DEV && import.meta.env.BASE_URL !== '/') {
        // Use the `UNLEASH_BASE_PATH` env var instead of the meta tag.
        return joinPaths(import.meta.env.BASE_URL);
    }

    return value === '::baseUriPath::' ? '' : joinPaths(value);
};

// Join paths with a leading separator and without a trailing separator.
const joinPaths = (...paths: string[]): string => {
    return ['', ...paths]
        .join('/')
        .replace(/\/+$/g, '') // Remove trailing separators.
        .replace(/\/+/g, '/'); // Collapse repeated separators.
};

const basePathMetaTagContent = (): string => {
    const el = document.querySelector<HTMLMetaElement>(
        'meta[name="baseUriPath"]'
    );

    return el?.content ?? '';
};

export const basePath = parseBasePath();
