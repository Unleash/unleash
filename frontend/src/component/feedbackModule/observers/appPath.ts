import { normalizePath } from 'utils/normalizePath';

const isUnderBasePath = (pathname: string, basePath: string): boolean =>
    pathname === basePath || pathname.startsWith(`${basePath}/`);

export const appPath = (pathname: string, basePath: string): string => {
    const withoutBase = isUnderBasePath(pathname, basePath)
        ? pathname.slice(basePath.length)
        : pathname;
    return normalizePath(withoutBase);
};
