import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useImpactMetricsState } from './useImpactMetricsState.ts';
import type { FC } from 'react';
import type { ImpactMetricsState } from '../types.ts';

const server = testServerSetup();

const TestComponent: FC<{
    enableActions?: boolean;
}> = ({ enableActions = false }) => {
    const {
        charts,
        layout,
        loading,
        error,
        addChart,
        updateChart,
        deleteChart,
    } = useImpactMetricsState();

    return (
        <div>
            <span data-testid='charts-count'>{charts.length}</span>
            <span data-testid='layout-count'>{layout.length}</span>
            <span data-testid='loading'>{loading.toString()}</span>
            <span data-testid='error'>{error ? 'has-error' : 'no-error'}</span>

            {enableActions && (
                <button
                    type='button'
                    data-testid='add-chart'
                    onClick={() =>
                        addChart({
                            selectedSeries: 'test-series',
                            selectedRange: 'day',
                            beginAtZero: true,
                            aggregationMode: 'count',
                            selectedLabels: {},
                            title: 'Test Chart',
                        })
                    }
                >
                    Add Chart
                </button>
            )}

            {enableActions && charts.length > 0 && (
                <button
                    type='button'
                    data-testid='update-chart'
                    onClick={() =>
                        updateChart(charts[0].id, { title: 'Updated Chart' })
                    }
                >
                    Update Chart
                </button>
            )}

            {enableActions && charts.length > 0 && (
                <button
                    type='button'
                    data-testid='delete-chart'
                    onClick={() => deleteChart(charts[0].id)}
                >
                    Delete Chart
                </button>
            )}
        </div>
    );
};

const mockSettings: ImpactMetricsState = {
    charts: [
        {
            id: 'test-chart',
            selectedSeries: 'test-series',
            selectedRange: 'day' as const,
            beginAtZero: true,
            aggregationMode: 'count',
            selectedLabels: {},
            title: 'Test Chart',
        },
    ],
    layout: [
        {
            i: 'test-chart',
            x: 0,
            y: 0,
            w: 6,
            h: 4,
            minW: 4,
            minH: 2,
            maxW: 12,
            maxH: 8,
        },
    ],
};

const emptySettings: ImpactMetricsState = {
    charts: [],
    layout: [],
};

describe('useImpactMetricsState', () => {
    beforeEach(() => {
        testServerRoute(server, '/api/admin/ui-config', {});
    });

    it('loads settings from API', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            mockSettings,
        );

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('charts-count')).toHaveTextContent('1');
            expect(screen.getByTestId('layout-count')).toHaveTextContent('1');
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
            expect(screen.getByTestId('error')).toHaveTextContent('no-error');
        });
    });

    it('handles empty settings', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            emptySettings,
        );

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('charts-count')).toHaveTextContent('0');
            expect(screen.getByTestId('layout-count')).toHaveTextContent('0');
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
            expect(screen.getByTestId('error')).toHaveTextContent('no-error');
        });
    });

    it('handles API errors', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            { message: 'Server error' },
            'get',
            500,
        );

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('error')).toHaveTextContent('has-error');
        });
    });

    it('adds a chart successfully', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            emptySettings,
        );

        render(<TestComponent enableActions />);

        await waitFor(() => {
            expect(screen.getByTestId('charts-count')).toHaveTextContent('0');
        });

        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            {
                charts: [
                    {
                        id: 'new-chart-id',
                        selectedSeries: 'test-series',
                        selectedRange: 'day',
                        beginAtZero: true,
                        mode: 'count',
                        selectedLabels: {},
                        title: 'Test Chart',
                    },
                ],
                layout: [
                    {
                        i: 'new-chart-id',
                        x: 0,
                        y: 0,
                        w: 6,
                        h: 4,
                        minW: 4,
                        minH: 2,
                        maxW: 12,
                        maxH: 8,
                    },
                ],
            },
            'put',
            200,
        );

        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            {
                charts: [
                    {
                        id: 'new-chart-id',
                        selectedSeries: 'test-series',
                        selectedRange: 'day',
                        beginAtZero: true,
                        mode: 'count',
                        selectedLabels: {},
                        title: 'Test Chart',
                    },
                ],
                layout: [
                    {
                        i: 'new-chart-id',
                        x: 0,
                        y: 0,
                        w: 6,
                        h: 4,
                        minW: 4,
                        minH: 2,
                        maxW: 12,
                        maxH: 8,
                    },
                ],
            },
            'get',
            200,
        );

        const addButton = screen.getByTestId('add-chart');
        await userEvent.click(addButton);

        await waitFor(
            () => {
                expect(screen.getByTestId('charts-count')).toHaveTextContent(
                    '1',
                );
            },
            { timeout: 5000 },
        );
    });

    it('updates a chart successfully', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            mockSettings,
        );

        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            {
                charts: [
                    {
                        ...mockSettings.charts[0],
                        title: 'Updated Chart',
                    },
                ],
                layout: mockSettings.layout,
            },
            'put',
            200,
        );

        render(<TestComponent enableActions />);

        await waitFor(() => {
            expect(screen.getByTestId('charts-count')).toHaveTextContent('1');
        });

        const updateButton = screen.getByTestId('update-chart');
        await userEvent.click(updateButton);

        await waitFor(() => {
            expect(screen.getByTestId('charts-count')).toHaveTextContent('1');
        });
    });

    it('deletes a chart successfully', async () => {
        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            mockSettings,
        );

        render(<TestComponent enableActions />);

        await waitFor(() => {
            expect(screen.getByTestId('charts-count')).toHaveTextContent('1');
        });

        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            emptySettings,
            'put',
            200,
        );

        testServerRoute(
            server,
            '/api/admin/impact-metrics/settings',
            emptySettings,
            'get',
            200,
        );

        const deleteButton = screen.getByTestId('delete-chart');
        await userEvent.click(deleteButton);

        await waitFor(
            () => {
                expect(screen.getByTestId('charts-count')).toHaveTextContent(
                    '0',
                );
            },
            { timeout: 5000 },
        );
    });
});
