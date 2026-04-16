import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CollapsedMetricGroupCard } from './CollapsedMetricGroupCard';
import type { ImpactMetricsConfigSchema } from 'openapi';

// Mock the underlying Chart.js-based chart; jsdom doesn't provide the DOM
// APIs chart.js relies on (addEventListener on internal canvas proxy). We
// are testing CollapsedMetricGroupCard's composition, not chart rendering.
vi.mock(
    'component/impact-metrics/MultimetricChart/MultimetricChart',
    () => ({
        MultimetricChart: () => null,
    }),
);

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

const mockFeatureEvents = () => ({
    events: [],
    total: 0,
});

const stubEndpoints = () => {
    testServerRoute(
        server,
        '/api/admin/impact-metrics/',
        mockImpactResponse(5),
    );
    testServerRoute(
        server,
        '/api/admin/search/events',
        mockFeatureEvents(),
    );
};

describe('CollapsedMetricGroupCard', () => {
    it('renders a multi-series card with one series per config in input order', async () => {
        stubEndpoints();

        const configs = [
            make({
                id: 'a',
                metricName: 'unleash_counter_a',
                displayName: 'A',
                title: 'Alpha',
            }),
            make({
                id: 'b',
                metricName: 'unleash_counter_b',
                displayName: 'B',
                title: 'Bravo',
            }),
        ];

        render(
            <CollapsedMetricGroupCard
                configs={configs}
                projectId='p1'
                featureName='f1'
            />,
        );

        await waitFor(() => {
            expect(screen.getByText(/Alpha \+1 more/)).toBeInTheDocument();
        });

        expect(screen.getByText('2 metrics · Last 24 hours')).toBeInTheDocument();
    });

    it('renders href linking to the metrics page', async () => {
        stubEndpoints();

        const configs = [
            make({ id: 'a', metricName: 'unleash_counter_a' }),
            make({ id: 'b', metricName: 'unleash_counter_b' }),
        ];

        render(
            <CollapsedMetricGroupCard
                configs={configs}
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

    it('falls back through title -> displayName -> metricName for the title', async () => {
        stubEndpoints();

        const configs = [
            make({
                id: 'a',
                metricName: 'fallback_metric',
                displayName: '',
                title: undefined,
            }),
            make({ id: 'b', metricName: 'another' }),
        ];

        render(
            <CollapsedMetricGroupCard
                configs={configs}
                projectId='p'
                featureName='f'
            />,
        );

        await waitFor(() => {
            expect(
                screen.getByText(/fallback_metric \+1 more/),
            ).toBeInTheDocument();
        });
    });
});
