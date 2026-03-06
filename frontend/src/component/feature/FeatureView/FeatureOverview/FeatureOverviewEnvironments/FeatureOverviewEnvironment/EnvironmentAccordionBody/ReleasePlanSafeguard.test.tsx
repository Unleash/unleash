import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import { ReleasePlanSafeguard } from './ReleasePlanSafeguard.tsx';
import type { IReleasePlan } from 'interfaces/releasePlans';

vi.mock(
    '../../../ReleasePlan/SafeguardForm/MiniMetricsChartWithTooltip.tsx',
    () => ({
        MiniMetricsChartWithTooltip: () => null,
    }),
);

const server = testServerSetup();

const permissions = [
    {
        permission: UPDATE_FEATURE_STRATEGY,
        project: 'default',
        environment: 'production',
    },
];

const planWithoutSafeguards: IReleasePlan = {
    id: 'plan-1',
    name: 'Release Plan 1',
    description: 'A release plan',
    createdAt: '2024-01-01T00:00:00.000Z',
    createdByUserId: 1,
    featureName: 'feature1',
    environment: 'production',
    milestones: [],
    safeguards: [],
};

const planWithSafeguard: IReleasePlan = {
    ...planWithoutSafeguards,
    safeguards: [
        {
            id: 'safeguard-1',
            action: { id: 'action-1', type: 'pause' },
            impactMetric: {
                id: 'metric-1',
                metricName: 'http_requests_total',
                timeRange: 'day',
                aggregationMode: 'rps',
                labelSelectors: { appName: ['*'] },
            },
            triggerCondition: {
                operator: '>',
                threshold: 100,
            },
        },
    ],
};

const setupServerRoutes = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
        flags: { safeguards: true },
    });
    testServerRoute(server, '/api/admin/user', {
        user: {
            isAPI: false,
            id: 1,
            name: 'Some User',
            email: 'user@example.com',
            imageUrl: 'https://gravatar.com/avatar/test?s=42&d=retro&r=g',
            seenAt: '2024-01-01T00:00:00.000Z',
            loginAttempts: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
        },
        permissions,
        feedback: [],
        splash: {},
    });
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'production',
                type: 'production',
                changeRequestEnabled: false,
            },
        ],
        'get',
    );
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending/feature1',
        [],
    );
    testServerRoute(server, '/api/admin/impact-metrics/metadata', {
        series: {
            http_requests_total: {
                type: 'counter',
                help: 'Total HTTP requests',
                displayName: 'HTTP Requests',
            },
        },
    });
    testServerRoute(server, '/api/admin/impact-metrics/data', {
        labels: { appName: [] },
        data: [],
    });
    testServerRoute(server, '/api/admin/projects/default/features/feature1', {
        environments: [
            {
                name: 'production',
                enabled: true,
                type: 'production',
                strategies: [],
            },
        ],
        name: 'feature1',
        project: 'default',
    });
};

const Component = ({
    plan,
    onSafeguardChange,
}: {
    plan: IReleasePlan;
    onSafeguardChange: () => void;
}) => (
    <Routes>
        <Route
            path='/projects/:projectId/features/:featureId'
            element={
                <ReleasePlanSafeguard
                    plan={plan}
                    environmentName='production'
                    featureId='feature1'
                    onSafeguardChange={onSafeguardChange}
                />
            }
        />
    </Routes>
);

beforeEach(() => {
    setupServerRoutes();
});

const enableChangeRequests = () => {
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'production',
                type: 'production',
                changeRequestEnabled: true,
            },
        ],
        'get',
    );
};

describe('ReleasePlanSafeguard', () => {
    test('should add safeguard and send form data to API', async () => {
        const user = userEvent.setup();
        const onSafeguardChange = vi.fn();

        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/release-plans/plan-1/safeguards',
            {},
            'put',
        );

        render(
            <Component
                plan={planWithoutSafeguards}
                onSafeguardChange={onSafeguardChange}
            />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        await screen.findByText('Pause automation when');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });

        expect(requests).toMatchObject([
            {
                impactMetric: {
                    metricName: 'http_requests_total',
                    timeRange: 'day',
                    aggregationMode: 'rps',
                    labelSelectors: { appName: ['*'] },
                },
                triggerCondition: {
                    operator: '>',
                    threshold: 0,
                },
            },
        ]);
    });

    test('should delete existing safeguard', async () => {
        const user = userEvent.setup();
        const onSafeguardChange = vi.fn();

        testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/release-plans/plan-1/safeguards/safeguard-1',
            {},
            'delete',
        );

        render(
            <Component
                plan={planWithSafeguard}
                onSafeguardChange={onSafeguardChange}
            />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        await screen.findByText('Pause automation when');

        const removeButton = await screen.findByRole('button', {
            name: 'Remove safeguard',
        });
        await user.click(removeButton);

        const confirmButton = await screen.findByRole('button', {
            name: 'Remove safeguard',
        });
        await user.click(confirmButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
    });

    test('should add safeguard via change request', async () => {
        const user = userEvent.setup();
        const onSafeguardChange = vi.fn();
        enableChangeRequests();

        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/environments/production/change-requests',
            {},
            'post',
        );

        render(
            <Component
                plan={planWithoutSafeguards}
                onSafeguardChange={onSafeguardChange}
            />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        await screen.findByText('Pause automation when');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await screen.findByText('Add suggestion to draft');
        const confirmButton = await screen.findByRole('button', {
            name: 'Add suggestion to draft',
        });
        await user.click(confirmButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });

        expect(requests).toMatchObject([
            {
                feature: 'feature1',
                action: 'changeSafeguard',
                payload: {
                    planId: 'plan-1',
                    safeguard: {
                        impactMetric: {
                            metricName: 'http_requests_total',
                            timeRange: 'day',
                            aggregationMode: 'rps',
                            labelSelectors: { appName: ['*'] },
                        },
                        triggerCondition: {
                            operator: '>',
                            threshold: 0,
                        },
                    },
                },
            },
        ]);
    });

    test('should delete safeguard via change request', async () => {
        const user = userEvent.setup();
        const onSafeguardChange = vi.fn();
        enableChangeRequests();

        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/environments/production/change-requests',
            {},
            'post',
        );

        render(
            <Component
                plan={planWithSafeguard}
                onSafeguardChange={onSafeguardChange}
            />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        await screen.findByText('Pause automation when');

        const removeButton = await screen.findByRole('button', {
            name: 'Remove safeguard',
        });
        await user.click(removeButton);

        const confirmButton = await screen.findByRole('button', {
            name: 'Add suggestion to draft',
        });
        await user.click(confirmButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });

        expect(requests).toMatchObject([
            {
                feature: 'feature1',
                action: 'deleteSafeguard',
                payload: {
                    planId: 'plan-1',
                    safeguardId: 'safeguard-1',
                },
            },
        ]);
    });
});
