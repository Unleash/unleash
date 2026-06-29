import { describe, expect, it } from 'vitest';
import { routes } from 'component/menu/routes';
import { resolvePageView } from './resolvePageView';

describe('resolvePageView', () => {
    it('replaces concrete resource ids with their param names', () => {
        // Concrete ids become :params so the path is low-cardinality.
        const routes = [
            { path: '/projects/:projectId/features/:featureId/edit' },
        ];

        expect(
            resolvePageView(
                routes,
                '/projects/default/features/new-onboarding/edit',
            ),
        ).toEqual({
            matched: true,
            path: '/projects/:projectId/features/:featureId/edit',
            params: { projectId: 'default', featureId: 'new-onboarding' },
        });
    });

    it('appends the sub-page name when a route delegates to a nested router', () => {
        // Append the splat tail so sub-pages don't all collapse to the parent.
        const routes = [{ path: '/projects/:projectId/*' }];

        expect(resolvePageView(routes, '/projects/default/settings')).toEqual({
            matched: true,
            path: '/projects/:projectId/settings',
            params: { projectId: 'default' },
        });
    });

    it('keeps the bare parent path when a delegating route has no sub-page', () => {
        // No tail to append; record the bare parent.
        const routes = [{ path: '/projects/:projectId/*' }];

        expect(resolvePageView(routes, '/projects/default')).toEqual({
            matched: true,
            path: '/projects/:projectId',
            params: { projectId: 'default' },
        });
    });

    it('reports no match for an unrecognized URL', () => {
        // No match: callers skip these instead of recording a junk path.
        const routes = [{ path: '/projects/:projectId/*' }];

        expect(resolvePageView(routes, '/nope/nowhere')).toEqual({
            matched: false,
        });
    });

    it('resolves real application routes by their templated shape', () => {
        // Guards against a routes refactor (e.g. moving to nested children)
        // silently producing wrong paths: this exercises the real route table,
        // not synthetic patterns. '/' is intentionally absent from it, so the
        // landing redirect must stay unmatched and therefore unrecorded.
        expect(
            resolvePageView(
                routes,
                '/projects/default/features/new-onboarding/edit',
            ),
        ).toEqual({
            matched: true,
            path: '/projects/:projectId/features/:featureId/edit',
            params: { projectId: 'default', featureId: 'new-onboarding' },
        });
        expect(resolvePageView(routes, '/projects/default/settings')).toEqual({
            matched: true,
            path: '/projects/:projectId/settings',
            params: { projectId: 'default' },
        });
        expect(resolvePageView(routes, '/')).toEqual({ matched: false });
    });
});
