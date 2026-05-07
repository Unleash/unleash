import { beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ImpactMetricsAdmin } from './ImpactMetricsAdmin.tsx';

const server = testServerSetup();

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { externalImpactMetrics: true },
    });
    testServerRoute(server, '/api/admin/impact-metrics/external-source', {
        enabled: false,
        url: '',
    });
});

test('user journey: disabled state → invalid URL error → valid URL with metrics', async () => {
    const user = userEvent.setup();

    render(<ImpactMetricsAdmin />, {
        permissions: [{ permission: 'ADMIN' }],
    });

    const testButton = await screen.findByRole('button', {
        name: 'Test integration',
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(testButton).toBeDisabled();
    expect(saveButton).toBeDisabled();

    const urlField = screen.getByPlaceholderText('Metrics source URL');
    await user.type(urlField, 'not-a-valid-url');
    expect(testButton).toBeEnabled();

    testServerRoute(
        server,
        '/api/admin/impact-metrics/external-source/validate',
        { error: 'Invalid URL' },
        'post',
    );
    await user.click(testButton);

    expect(await screen.findByText('Invalid URL')).toBeInTheDocument();

    await user.clear(urlField);
    testServerRoute(
        server,
        '/api/admin/impact-metrics/external-source/validate',
        {
            metrics: ['http_requests_total', 'unleash_counter_external_metric'],
        },
        'post',
    );
    await user.type(urlField, 'http://prometheus.example.com');
    await user.click(testButton);

    expect(
        await screen.findByText(
            'We received 2 metrics from your metrics source URL',
        ),
    ).toBeInTheDocument();
    expect(screen.getByText('http_requests_total')).toBeInTheDocument();
    expect(
        screen.getByText('unleash_counter_external_metric'),
    ).toBeInTheDocument();
});
