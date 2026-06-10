import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { testServerSetup } from 'utils/testServer';
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

// The hook fires one search for active features and one for archived
// (`archived=IS:true`), so the stub branches on that search param.
const setupSearchApi = (active: StubFeature[], archived: StubFeature[]) => {
    server.use(
        http.get('/api/admin/search/features', ({ request }) => {
            const isArchived =
                new URL(request.url).searchParams.get('archived') === 'IS:true';
            const features = isArchived ? archived : active;
            return HttpResponse.json({ features, total: features.length });
        }),
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

    it('keeps a single entry when both searches return the same feature', async () => {
        setupSearchApi(
            [feature('my-flag')],
            [feature('my-flag', { lifecycle: null })],
        );

        const { result } = renderHook(() => useResolvedFeatures(['my-flag']), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.features).toEqual([
            expect.objectContaining({
                name: 'my-flag',
                lifecycleStage: 'live',
            }),
        ]);
    });
});
