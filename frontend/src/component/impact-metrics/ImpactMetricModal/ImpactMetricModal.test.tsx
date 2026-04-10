import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import { ImpactMetricModal } from './ImpactMetricModal.tsx';
import type { ChartConfig } from '../types.ts';

vi.mock('../ImpactMetricsChart.tsx', () => ({
    ImpactMetricsChart: () => null,
}));

const server = testServerSetup();

const externalMetricSeries = [
    {
        name: 'my_external_metric',
        displayName: 'my_external_metric',
        help: 'A custom external metric',
        source: 'external' as const,
    },
];

const setupServerRoutes = (
    labels: Record<string, string[]> = {
        my_custom_label: ['value1', 'value2'],
        metric_type: ['counter'],
    },
) => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
        flags: {},
    });
    testServerRoute(server, '/api/admin/impact-metrics/', {
        series: [],
        labels,
    });
};

beforeEach(() => {
    setupServerRoutes();
});

describe('ImpactMetricModal', () => {
    test('creates a new external metric chart with a custom label selection', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        const onClose = vi.fn();

        render(
            <ImpactMetricModal
                open
                onClose={onClose}
                onSave={onSave}
                metricSeries={externalMetricSeries}
            />,
        );

        await screen.findByRole('heading', { name: 'Add impact metric' });

        const metricInput = screen.getByLabelText(/metric name/i);
        await user.click(metricInput);
        const metricOption = await screen.findByRole('option', {
            name: /my_external_metric/i,
        });
        await user.click(metricOption);

        const labelInput = await screen.findByLabelText('my_custom_label');
        await user.click(labelInput);
        const labelOption = await screen.findByRole('option', {
            name: 'value1',
        });
        await user.click(labelOption);

        const submitButton = await screen.findByRole('button', {
            name: 'Add impact metric',
        });
        await user.click(submitButton);

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledTimes(1);
        });
        expect(onSave).toHaveBeenCalledWith({
            title: undefined,
            metricName: 'my_external_metric',
            timeRange: 'day',
            yAxisMin: 'auto',
            aggregationMode: 'count',
            labelSelectors: { my_custom_label: ['value1'] },
            source: 'external',
        });
        expect(onClose).toHaveBeenCalled();
    });

    test('prefills the form when editing an existing external metric chart', async () => {
        const initialConfig: ChartConfig = {
            id: 'chart-1',
            title: 'My existing chart',
            metricName: 'my_external_metric',
            timeRange: 'week',
            yAxisMin: 'zero',
            aggregationMode: 'rps',
            labelSelectors: { my_custom_label: ['value1'] },
            source: 'external',
        };

        render(
            <ImpactMetricModal
                open
                onClose={vi.fn()}
                onSave={vi.fn()}
                metricSeries={externalMetricSeries}
                initialConfig={initialConfig}
            />,
        );

        await screen.findByRole('heading', { name: 'Edit impact metric' });
        await screen.findByRole('button', { name: 'Update' });

        expect(
            screen.getByDisplayValue('My existing chart'),
        ).toBeInTheDocument();
        expect(
            screen.getByDisplayValue('my_external_metric'),
        ).toBeInTheDocument();

        await screen.findByLabelText('my_custom_label');
        expect(screen.getByText('value1')).toBeInTheDocument();

        const beginAtZero = screen.getByRole('checkbox', {
            name: /begin at zero/i,
        });
        expect(beginAtZero).toBeChecked();
    });
});
