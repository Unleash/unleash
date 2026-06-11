import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { describe, expect, it } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useResolvedFeatures } from './useResolvedFeatures';

const server = testServerSetup();

const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {children}
    </SWRConfig>
);

type StubFeature = {
    name: string;
    project?: string;
    type?: string;
    lifecycle?: { stage: string } | null;
};

const feature = (
    name: string,
    overrides: Partial<StubFeature> = {},
): StubFeature => ({
    name,
    project: 'default',
    type: 'release',
    lifecycle: { stage: 'live' },
    ...overrides,
});

// The hook fires one search for active features and one for archived, both
// against the same path, differing only by the `archived` search param.
// The archived route is registered last so msw checks it first; it falls
// through to the active route when the param is absent.
const setupSearchApi = (active: StubFeature[], archived: StubFeature[]) => {
    testServerRoute(server, '/api/admin/search/features', {
        features: active,
        total: active.length,
    });
    testServerRoute(
        server,
        '/api/admin/search/features',
        { features: archived, total: archived.length },
        'get',
        200,
        { archived: 'IS:true' },
    );
};

describe('useResolvedFeatures', () => {
    it('merges active and archived followed features', async () => {
        setupSearchApi(
            [feature('active-flag')],
            [feature('archived-flag', { lifecycle: { stage: 'archived' } })],
        );

        const { result } = renderHook(
            () => useResolvedFeatures(['active-flag', 'archived-flag']),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.features).toEqual([
            {
                name: 'active-flag',
                project: 'default',
                type: 'release',
                lifecycleStage: 'live',
            },
            {
                name: 'archived-flag',
                project: 'default',
                type: 'release',
                lifecycleStage: 'archived',
            },
        ]);
    });

    it('falls back to the archived stage for archived features without lifecycle data', async () => {
        setupSearchApi([], [feature('old-flag', { lifecycle: null })]);

        const { result } = renderHook(() => useResolvedFeatures(['old-flag']), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.features).toEqual([
            expect.objectContaining({
                name: 'old-flag',
                lifecycleStage: 'archived',
            }),
        ]);
    });

    it('excludes search matches that are not followed', async () => {
        setupSearchApi(
            [feature('my-flag'), feature('my-flag-two')],
            [feature('my-flag-archived')],
        );

        const { result } = renderHook(() => useResolvedFeatures(['my-flag']), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.features.map(({ name }) => name)).toEqual([
            'my-flag',
        ]);
    });
});
