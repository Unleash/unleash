import { matchRoutes } from 'react-router';

// `matched: false` when no route matches; callers skip recording those so an
// unrecognised URL never becomes a distinct, meaningless path in analytics.
export type ResolvedPageView =
    | { matched: true; path: string; params: Record<string, string> }
    | { matched: false };

// Replace a route's trailing splat ('/*') with the actual matched tail, e.g.
// '/projects/:projectId/*' + 'settings' -> '/projects/:projectId/settings'.
// With no tail the splat just drops; patterns without a splat are unchanged.
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

    // matchRoutes only sees the parent `/*` route: Unleash declares the nested
    // sub-routes inside a child <Routes>, so there is no pattern here to template
    // the tail. Splice the raw matched tail back in so sibling sub-tabs don't all
    // collapse to '/projects/:projectId'. Any ids in the tail stay literal.
    const path = fillSplat(leaf.route.path, leaf.params['*']);

    return { matched: true, path, params: namedParams(leaf.params) };
};
