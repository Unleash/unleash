import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
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

const setupStaticStubs = () => {
    testServerRoute(server, '/api/admin/search/features', {
        features: [],
        total: 0,
    });
    testServerRoute(server, '/api/admin/search/events', {
        events: [],
        total: 0,
    });
};

// testServerRoute serves one static response per path, but this route's
// response has to vary with the metricName search param, so it stays raw msw.
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
    setupStaticStubs();
};

const setupMetricsError = () => {
    testServerRoute(
        server,
        '/api/admin/impact-metrics/',
        { error: 'boom' },
        'get',
        500,
    );
    setupStaticStubs();
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
        expect(result.current.flagImpacts).toEqual([]);
    });

    it('computes per-flag impacts from the goal series and flag events', async () => {
        const DAY_SEC = 24 * 60 * 60;
        // Hourly goal samples over a month: 10 before day 10, 20 after. A
        // flag flip at day 10 with the month view's ±1d window measures
        // pre 10 vs post 20 → +100%.
        server.use(
            http.get('/api/admin/impact-metrics/', () =>
                HttpResponse.json({
                    start: '0',
                    end: String(30 * DAY_SEC),
                    series: [
                        {
                            data: Array.from({ length: 30 * 24 }, (_, hour) => [
                                hour * 3600,
                                hour < 10 * 24 ? 10 : 20,
                            ]),
                        },
                    ],
                }),
            ),
        );
        testServerRoute(server, '/api/admin/search/features', {
            features: [],
            total: 0,
        });
        testServerRoute(server, '/api/admin/search/events', {
            events: [
                {
                    id: 1,
                    createdAt: new Date(10 * DAY_SEC * 1000).toISOString(),
                    type: 'feature-environment-enabled',
                    createdBy: 'someone',
                    featureName: 'my-flag',
                },
            ],
            total: 1,
        });

        const view = {
            ...viewWith([metric('goal', { goal: true })]),
            featureNames: ['my-flag'],
        };

        const { result } = renderHook(() => useGoalViewData(view), { wrapper });

        await waitFor(() => {
            expect(result.current.flagImpacts).toEqual([
                { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
            ]);
        });
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
        );
        setupStaticStubs();

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
        // No series and an empty (NaN) visible window → no impacts.
        expect(result.current.flagImpacts).toEqual([]);
    });
});
