import { matchRoutes } from 'react-router';

// Reports matched: false when no route matches; the caller skips recording those,
// so an unknown URL never becomes a meaningless path in analytics.
export type ResolvedPageView =
    | { matched: true; path: string; params: Record<string, string> }
    | { matched: false };

// Replaces a trailing "/*" with the matched tail, so "/projects/:projectId/*" plus
// "settings" becomes "/projects/:projectId/settings". When there is no tail the splat
// is dropped, and a pattern without a splat is left unchanged.
const fillSplat = (pattern: string, tail = ''): string =>
    pattern.replace(/\*$/, tail).replace(/\/+$/, '') || '/';

const namedParams = (
    params: Record<string, string | undefined>,
): Record<string, string> =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([key, value]) => key !== '*' && value !== undefined,
        ),
    ) as Record<string, string>;

export const resolvePageView = (
    routePatterns: { path: string }[],
    pathname: string,
): ResolvedPageView => {
    const matches = matchRoutes(routePatterns, pathname);
    const leaf = matches?.at(-1);
    if (!leaf?.route.path) {
        return { matched: false };
    }

    // Unleash nests its sub-routes inside a child <Routes>, so matchRoutes only sees
    // the parent "/*" here. We splice the matched tail back in so sibling sub-tabs
    // don't all collapse to "/projects/:projectId"; any ids in that tail stay literal.
    const path = fillSplat(leaf.route.path, leaf.params['*']);

    return { matched: true, path, params: namedParams(leaf.params) };
};
