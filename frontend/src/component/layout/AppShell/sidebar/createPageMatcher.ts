export const isWithinPath = (pathname: string, path: string): boolean =>
    pathname === path || pathname.startsWith(`${path}/`);

export const createPageMatcher =
    (paths: string[]) =>
    (pathname: string): boolean =>
        paths.some((path) => isWithinPath(pathname, path));

// The most specific match wins, so Project roles doesn't also match Root roles.
export const findCurrentRoute = <Route extends { path: string }>(
    pathname: string,
    routes: Route[],
): Route | undefined =>
    routes
        .filter(({ path }) => isWithinPath(pathname, path))
        .sort((a, b) => b.path.length - a.path.length)[0];
