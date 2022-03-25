export const getBasePathGenerator = () => {
    let basePath: string | undefined;
    const DEFAULT = '::baseUriPath::';

    return () => {
        if (process.env.NODE_ENV === 'development') {
            return '';
        }

        if (basePath !== undefined) {
            return basePath;
        }
        const baseUriPath = document.querySelector<HTMLMetaElement>(
            'meta[name="baseUriPath"]'
        );

        if (baseUriPath?.content) {
            basePath = baseUriPath?.content;

            if (basePath === DEFAULT) {
                basePath = '';
                return '';
            }

            return basePath;
        }
        basePath = '';
        return basePath;
    };
};

export const getBasePath = getBasePathGenerator();

export const formatApiPath = (path: string) => {
    const basePath = getBasePath();

    if (basePath) {
        return `${basePath}/${path}`;
    }
    return `/${path}`;
};

export const formatAssetPath = (path: string) => {
    const basePath = getBasePath();

    if (basePath) {
        return `${basePath}/${path}`;
    }

    return path;
};
