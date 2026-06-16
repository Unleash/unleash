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

const setupStaticStubs = (events: unknown[] = []) => {
    testServerRoute(server, '/api/admin/search/features', {
        features: [],
        total: 0,
    });
    testServerRoute(server, '/api/admin/search/events', {
        events,
        total: events.length,
    });
};

type SeriesData = [number, number][];
type MetricsResponse = {
    start: string;
    end: string;
    series: { data: SeriesData }[];
};

const setupImpactMetrics = (respond: (request: Request) => MetricsResponse) => {
    server.use(
        http.get('/api/admin/impact-metrics/', ({ request }) =>
            HttpResponse.json(respond(request)),
        ),
    );
};

const setupApi = (valueByMetric: Record<string, number>) => {
    setupImpactMetrics((request) => {
        const metricName = new URL(request.url).searchParams.get('metricName');
        const value = valueByMetric[metricName ?? ''] ?? 0;
        return { start: '0', end: '1', series: [{ data: [[1, value]] }] };
    });
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

const DAY_SEC = 24 * 60 * 60;

const setupApiWithFlipAtDayTen = (before: number, after: number) => {
    setupImpactMetrics(() => ({
        start: '0',
        end: String(30 * DAY_SEC),
        series: [
            {
                data: Array.from({ length: 30 * 24 }, (_, hour) => [
                    hour * 3600,
                    hour < 10 * 24 ? before : after,
                ]),
            },
        ],
    }));
    setupStaticStubs([
        {
            id: 1,
            createdAt: new Date(10 * DAY_SEC * 1000).toISOString(),
            type: 'feature-environment-enabled',
            createdBy: 'someone',
            featureName: 'my-flag',
        },
    ]);
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
        setupApiWithFlipAtDayTen(10, 20);

        const view = {
            ...viewWith([metric('goal', { goal: true })]),
            featureNames: ['my-flag'],
        };

        const { result } = renderHook(() => useGoalViewData(view), { wrapper });

        await waitFor(() => {
            expect(result.current.flagImpacts).toMatchObject([
                { featureName: 'my-flag', deltaPct: 100, tone: 'up' },
            ]);
        });
    });

    it('queries the API with the extended time ranges', async () => {
        const requestedRanges: (string | null)[] = [];
        setupImpactMetrics((request) => {
            requestedRanges.push(
                new URL(request.url).searchParams.get('range'),
            );
            return { start: '0', end: '1', series: [{ data: [[1, 1]] }] };
        });
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
        expect(result.current.flagImpacts).toEqual([]);
    });
});
