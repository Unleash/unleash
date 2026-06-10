import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { testServerSetup } from 'utils/testServer';
import { useGoalViewData } from './useGoalViewData';
import type { MetricView, ViewMetricConfig } from '../views/types';

const server = testServerSetup();

const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {children}
    </SWRConfig>
);

const metric = (
    id: string,
    overrides: Partial<ViewMetricConfig> = {},
): ViewMetricConfig => ({
    id,
    metricName: id,
    displayName: id,
    aggregationMode: 'count',
    labelSelectors: {},
    source: 'internal',
    title: id,
    yAxisMin: 'auto',
    timeRange: 'month',
    ...overrides,
});

const viewWith = (metrics: ViewMetricConfig[]): MetricView => ({
    id: 'view',
    title: 'View',
    featureNames: [],
    metrics,
    timeRange: 'month',
    environment: 'production',
    createdAt: 0,
    updatedAt: 0,
});

const setupApi = (valueByMetric: Record<string, number>) => {
    server.use(
        http.get('/api/admin/impact-metrics/', ({ request }) => {
            const metricName = new URL(request.url).searchParams.get(
                'metricName',
            );
            const value = valueByMetric[metricName ?? ''] ?? 0;
            return HttpResponse.json({
                start: '0',
                end: '1',
                series: [{ data: [[1, value]] }],
            });
        }),
    );
    server.use(
        http.get('/api/admin/search/features', () =>
            HttpResponse.json({ features: [], total: 0 }),
        ),
    );
    server.use(
        http.get('/api/admin/search/events', () =>
            HttpResponse.json({ events: [], total: 0 }),
        ),
    );
};

const setupMetricsError = () => {
    server.use(
        http.get('/api/admin/impact-metrics/', () =>
            HttpResponse.json({ error: 'boom' }, { status: 500 }),
        ),
    );
    server.use(
        http.get('/api/admin/search/features', () =>
            HttpResponse.json({ features: [], total: 0 }),
        ),
    );
    server.use(
        http.get('/api/admin/search/events', () =>
            HttpResponse.json({ events: [], total: 0 }),
        ),
    );
};

describe('useGoalViewData', () => {
    it('picks the goal series/total by the goal metric index', async () => {
        setupApi({ support: 10, goal: 99 });

        const view = viewWith([
            metric('support'),
            metric('goal', { goal: true }),
        ]);

        const { result } = renderHook(() => useGoalViewData(view), { wrapper });

        await waitFor(() => {
            expect(result.current.goalSeries?.label).toBe('goal');
        });
        expect(result.current.goalSummary?.current).toBe(99);
    });

    it('has no goal series/summary when no metric is the goal', async () => {
        setupApi({ a: 5 });

        const view = viewWith([metric('a')]);

        const { result } = renderHook(() => useGoalViewData(view), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        expect(result.current.goalSeries).toBeUndefined();
        expect(result.current.goalSummary).toBeUndefined();
    });

    it('queries the API with the extended time ranges', async () => {
        const requestedRanges: (string | null)[] = [];
        server.use(
            http.get('/api/admin/impact-metrics/', ({ request }) => {
                requestedRanges.push(
                    new URL(request.url).searchParams.get('range'),
                );
                return HttpResponse.json({
                    start: '0',
                    end: '1',
                    series: [{ data: [[1, 1]] }],
                });
            }),
            http.get('/api/admin/search/features', () =>
                HttpResponse.json({ features: [], total: 0 }),
            ),
            http.get('/api/admin/search/events', () =>
                HttpResponse.json({ events: [], total: 0 }),
            ),
        );

        const view = viewWith([
            metric('goal', { goal: true, timeRange: 'threeMonths' }),
            metric('support', { timeRange: 'sixMonths' }),
        ]);

        const { result } = renderHook(() => useGoalViewData(view), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(requestedRanges.sort()).toEqual(['sixMonths', 'threeMonths']);
    });

    it('handles empty series from useGroupedImpactMetricsData without throwing', async () => {
        setupMetricsError();

        const view = viewWith([metric('goal', { goal: true })]);

        const { result } = renderHook(() => useGoalViewData(view), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.stepSeries).toEqual([]);
        expect(result.current.stepTotals).toEqual([]);
        expect(result.current.goalSeries).toBeUndefined();
        expect(result.current.goalSummary?.current).toBe(0);
    });
});
