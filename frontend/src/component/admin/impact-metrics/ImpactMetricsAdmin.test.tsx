import { beforeEach, describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ImpactMetricsAdmin } from './ImpactMetricsAdmin.tsx';

const server = testServerSetup();

const setupPage = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { externalImpactMetrics: true },
    });
    testServerRoute(server, '/api/admin/impact-metrics/external-source', {
        enabled: false,
        url: '',
    });
};

const setupTestRoute = (response: object, status = 200) =>
    testServerRoute(
        server,
        '/api/admin/impact-metrics/external-source/validate',
        response,
        'post',
        status,
    );

beforeEach(() => {
    setupPage();
});

describe('Test integration button', () => {
    test('is disabled when the URL field is empty', async () => {
        render(<ImpactMetricsAdmin />, {
            permissions: [{ permission: 'ADMIN' }],
        });

        const button = await screen.findByRole('button', {
            name: 'Test integration',
        });
        expect(button).toBeDisabled();
    });

    test('becomes enabled after typing a URL', async () => {
        const user = userEvent.setup();

        render(<ImpactMetricsAdmin />, {
            permissions: [{ permission: 'ADMIN' }],
        });

        await user.type(
            await screen.findByPlaceholderText('Metrics source URL'),
            'http://prometheus.example.com',
        );

        expect(
            screen.getByRole('button', { name: 'Test integration' }),
        ).toBeEnabled();
    });
});

describe('Test integration success', () => {
    test('shows success banner with metric count', async () => {
        const user = userEvent.setup();
        setupTestRoute({
            metrics: ['unleash_counter_external_metric', 'http_requests_total'],
        });

        render(<ImpactMetricsAdmin />, {
            permissions: [{ permission: 'ADMIN' }],
        });

        await user.type(
            await screen.findByPlaceholderText('Metrics source URL'),
            'http://prometheus.example.com',
        );
        await user.click(
            screen.getByRole('button', { name: 'Test integration' }),
        );

        expect(
            await screen.findByText(
                'We received 2 metrics from your metrics source URL',
            ),
        ).toBeInTheDocument();
    });

    test('shows the returned metric names in a list', async () => {
        const user = userEvent.setup();
        setupTestRoute({
            metrics: ['unleash_counter_external_metric', 'http_requests_total'],
        });

        render(<ImpactMetricsAdmin />, {
            permissions: [{ permission: 'ADMIN' }],
        });

        await user.type(
            await screen.findByPlaceholderText('Metrics source URL'),
            'http://prometheus.example.com',
        );
        await user.click(
            screen.getByRole('button', { name: 'Test integration' }),
        );

        expect(
            await screen.findByText('unleash_counter_external_metric'),
        ).toBeInTheDocument();
        expect(screen.getByText('http_requests_total')).toBeInTheDocument();
    });

    test('clears results when the URL is changed after a successful test', async () => {
        const user = userEvent.setup();
        setupTestRoute({ metrics: ['unleash_counter_external_metric'] });

        render(<ImpactMetricsAdmin />, {
            permissions: [{ permission: 'ADMIN' }],
        });

        const urlField =
            await screen.findByPlaceholderText('Metrics source URL');
        await user.type(urlField, 'http://prometheus.example.com');
        await user.click(
            screen.getByRole('button', { name: 'Test integration' }),
        );

        await screen.findByText('unleash_counter_external_metric');

        await user.type(urlField, '/extra');

        expect(
            screen.queryByText('unleash_counter_external_metric'),
        ).not.toBeInTheDocument();
    });
});

describe('Test integration errors', () => {
    test('shows inline error banner for a known error returned by the API', async () => {
        const user = userEvent.setup();
        setupTestRoute({ metrics: [], error: 'Unauthorized (HTTP 401)' });

        render(<ImpactMetricsAdmin />, {
            permissions: [{ permission: 'ADMIN' }],
        });

        await user.type(
            await screen.findByPlaceholderText('Metrics source URL'),
            'http://prometheus.example.com',
        );
        await user.click(
            screen.getByRole('button', { name: 'Test integration' }),
        );

        expect(
            await screen.findByText('Unauthorized (HTTP 401)'),
        ).toBeInTheDocument();
    });

    test('shows inline error banner for an unknown error (e.g. 500)', async () => {
        const user = userEvent.setup();
        setupTestRoute({}, 500);

        render(<ImpactMetricsAdmin />, {
            permissions: [{ permission: 'ADMIN' }],
        });

        await user.type(
            await screen.findByPlaceholderText('Metrics source URL'),
            'http://prometheus.example.com',
        );
        await user.click(
            screen.getByRole('button', { name: 'Test integration' }),
        );

        expect(
            await screen.findByText('Action could not be performed'),
        ).toBeInTheDocument();
    });
});
