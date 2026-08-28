import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { GroupedChartCard } from './GroupedChartCard';
import type { ConfigGroup } from './groupImpactConfigs';
import type { ImpactMetricsConfigSchema } from 'openapi';

// Mock the Chart.js-based chart component; jsdom doesn't provide the
// canvas APIs that Chart.js relies on.
vi.mock('component/impact-metrics/MultimetricChart/MultimetricChart', () => ({
    MultimetricChart: () => null,
}));

const server = testServerSetup();

const base: ImpactMetricsConfigSchema = {
    id: 'id-1',
    metricName: 'unleash_counter_signups',
    displayName: 'Signups',
    timeRange: 'day',
    aggregationMode: 'count',
    yAxisMin: 'auto',
    labelSelectors: {},
};

const make = (
    overrides: Partial<ImpactMetricsConfigSchema>,
): ImpactMetricsConfigSchema => ({ ...base, ...overrides });

const mockImpactResponse = (value: number) => ({
    start: '1700000000',
    end: '1700003600',
    step: '60',
    labels: {},
    series: [
        {
            metric: { __name__: 'unleash_counter' },
            data: [
                [1700000000, String(value)],
                [1700003600, String(value)],
            ],
        },
    ],
});

const mockEventsResponse = {
    events: [],
    total: 0,
};

const makeGroup = (configs: ImpactMetricsConfigSchema[]): ConfigGroup => ({
    key: 'day::count::auto::{}',
    timeRange: 'day',
    aggregationMode: 'count',
    labelSelectors: {},
    configs,
});

describe('GroupedChartCard', () => {
    it('renders a multi-series card with "+N more" title', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/',
            mockImpactResponse(5),
        );
        testServerRoute(server, '/api/admin/search/events', mockEventsResponse);

        const configs = [
            make({
                id: 'a',
                metricName: 'unleash_counter_a',
                displayName: 'Alpha',
            }),
            make({
                id: 'b',
                metricName: 'unleash_counter_b',
                displayName: 'Beta',
            }),
        ];

        render(
            <GroupedChartCard
                group={makeGroup(configs)}
                projectId='p1'
                featureName='f1'
            />,
        );

        await waitFor(() => {
            expect(screen.getByText('Alpha +1 more')).toBeInTheDocument();
        });

        expect(
            screen.getByText('2 metrics · Last 24 hours'),
        ).toBeInTheDocument();
    });

    it('renders href linking to the metrics page', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/',
            mockImpactResponse(5),
        );
        testServerRoute(server, '/api/admin/search/events', mockEventsResponse);

        const configs = [
            make({ id: 'a', metricName: 'unleash_counter_a' }),
            make({ id: 'b', metricName: 'unleash_counter_b' }),
        ];

        render(
            <GroupedChartCard
                group={makeGroup(configs)}
                projectId='proj'
                featureName='feat'
            />,
        );

        await waitFor(() => {
            const link = screen.getByRole('link');
            expect(link).toHaveAttribute(
                'href',
                '/projects/proj/features/feat/metrics',
            );
        });
    });

    it('uses title over displayName when available', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/',
            mockImpactResponse(5),
        );
        testServerRoute(server, '/api/admin/search/events', mockEventsResponse);

        const configs = [
            make({
                id: 'a',
                metricName: 'unleash_counter_a',
                displayName: 'Display',
                title: 'Custom Title',
            }),
            make({ id: 'b', metricName: 'unleash_counter_b' }),
        ];

        render(
            <GroupedChartCard
                group={makeGroup(configs)}
                projectId='p'
                featureName='f'
            />,
        );

        await waitFor(() => {
            expect(
                screen.getByText('Custom Title +1 more'),
            ).toBeInTheDocument();
        });
    });

    it('shows no "+N more" suffix for a single-config group', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/',
            mockImpactResponse(5),
        );
        testServerRoute(server, '/api/admin/search/events', mockEventsResponse);

        const configs = [
            make({
                id: 'a',
                metricName: 'unleash_counter_a',
                displayName: 'Solo',
            }),
        ];

        render(
            <GroupedChartCard
                group={makeGroup(configs)}
                projectId='p'
                featureName='f'
            />,
        );

        await waitFor(() => {
            expect(screen.getByText('Solo')).toBeInTheDocument();
        });

        expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
    });
});
