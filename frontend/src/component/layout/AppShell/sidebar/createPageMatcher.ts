export const isWithinPath = (pathname: string, path: string): boolean =>
    pathname === path || pathname.startsWith(`${path}/`);

export const createPageMatcher =
    (paths: string[]) =>
    (pathname: string): boolean =>
        paths.some((path) => isWithinPath(pathname, path));
