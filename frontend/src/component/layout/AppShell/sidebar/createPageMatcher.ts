export const createPageMatcher =
    (paths: string[]) =>
    (pathname: string): boolean =>
        paths.some(
            (path) => pathname === path || pathname.startsWith(`${path}/`),
        );
