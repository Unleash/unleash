import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import {
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { AddSafeguard, Safeguard } from './Safeguard.tsx';
import type { ISafeguard } from 'interfaces/releasePlans';

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
    {
        permission: UPDATE_FEATURE_ENVIRONMENT,
        project: 'default',
        environment: 'production',
    },
];

const releasePlan = { id: 'plan-1', name: 'Release Plan 1' };

const releasePlanSafeguard: ISafeguard = {
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
};

const featureEnvSafeguard: ISafeguard = {
    id: 'env-safeguard-1',
    action: {
        id: 'action-2',
        type: 'disableFeatureEnvironment',
    },
    impactMetric: {
        id: 'metric-2',
        metricName: 'http_requests_total',
        timeRange: 'hour',
        aggregationMode: 'count',
        labelSelectors: { appName: ['*'] },
    },
    triggerCondition: {
        operator: '>',
        threshold: 200,
    },
};

const defaultSafeguardPayload = {
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
};

const setupServerRoutes = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
        flags: { safeguards: true, featureEnvSafeguards: true },
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

const selectSafeguardType = async (
    user: ReturnType<typeof userEvent.setup>,
    menuLabel: string,
) => {
    const addButton = await screen.findByText('Add safeguard');
    await user.click(addButton);

    const menuItem = await screen.findByText(menuLabel);
    await user.click(menuItem);
};

const deleteSafeguard = async (
    user: ReturnType<typeof userEvent.setup>,
    confirmLabel = 'Remove safeguard',
) => {
    const removeButton = await screen.findByRole('button', {
        name: 'Remove safeguard',
    });
    await user.click(removeButton);

    const confirmButton = await screen.findByRole('button', {
        name: confirmLabel,
    });
    await user.click(confirmButton);
};

describe('AddSafeguard', () => {
    test('should show type menu when featureEnv is enabled', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(<AddSafeguard onSelect={onSelect} releasePlan={releasePlan} />, {
            route: '/',
            permissions,
        });

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        await screen.findByText('Disable environment');
        await screen.findByText('Pause automation');
    });

    test('should call onSelect with chosen type', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(<AddSafeguard onSelect={onSelect} releasePlan={releasePlan} />, {
            route: '/',
            permissions,
        });

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        const menuItem = await screen.findByText('Disable environment');
        await user.click(menuItem);

        expect(onSelect).toHaveBeenCalledWith('featureEnvironment');
    });

    test('should disable pause automation when no release plan', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(<AddSafeguard onSelect={onSelect} />, {
            route: '/',
            permissions,
        });

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        const pauseItem = await screen.findByText('Pause automation');
        expect(pauseItem.closest('li')).toHaveAttribute(
            'aria-disabled',
            'true',
        );
    });

    test('should directly select when featureEnv is not enabled', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();

        testServerRoute(server, '/api/admin/ui-config', {
            versionInfo: {
                current: { oss: 'version', enterprise: 'version' },
            },
            flags: { safeguards: true, featureEnvSafeguards: false },
        });

        render(<AddSafeguard onSelect={onSelect} releasePlan={releasePlan} />, {
            route: '/',
            permissions,
        });

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        expect(onSelect).toHaveBeenCalledWith('releasePlan');
    });

    test('should hide add button when featureEnv flag is off and no release plan', () => {
        const onSelect = vi.fn();

        testServerRoute(server, '/api/admin/ui-config', {
            versionInfo: {
                current: { oss: 'version', enterprise: 'version' },
            },
            flags: { safeguards: true, featureEnvSafeguards: false },
        });

        render(<AddSafeguard onSelect={onSelect} />, {
            route: '/',
            permissions,
        });

        expect(screen.queryByText('Add safeguard')).not.toBeInTheDocument();
    });
});

describe('Safeguard', () => {
    const renderSection = (props?: {
        featureEnvSafeguard?: ISafeguard;
        releasePlanSafeguard?: ISafeguard;
    }) => {
        const onSafeguardChange = vi.fn();
        render(
            <Routes>
                <Route
                    path='/projects/:projectId/features/:featureId'
                    element={
                        <Safeguard
                            featureEnvSafeguard={props?.featureEnvSafeguard}
                            releasePlan={releasePlan}
                            releasePlanSafeguard={props?.releasePlanSafeguard}
                            environmentName='production'
                            featureId='feature1'
                            onSafeguardChange={onSafeguardChange}
                        />
                    }
                />
            </Routes>,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );
        return { onSafeguardChange };
    };

    test('should show one Add safeguard button when no safeguards exist', async () => {
        renderSection();

        const buttons = await screen.findAllByText('Add safeguard');
        expect(buttons).toHaveLength(1);
    });

    test('should show existing feature env safeguard', async () => {
        renderSection({ featureEnvSafeguard });

        await screen.findByText('Disable environment when');
        expect(screen.queryByText('Add safeguard')).not.toBeInTheDocument();
    });

    test('should show existing release plan safeguard', async () => {
        renderSection({ releasePlanSafeguard });

        await screen.findByText('Pause automation when');
        expect(screen.queryByText('Add safeguard')).not.toBeInTheDocument();
    });

    test('should add feature env safeguard via API', async () => {
        const user = userEvent.setup();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/safeguards',
            {},
            'put',
        );

        const { onSafeguardChange } = renderSection();

        await selectSafeguardType(user, 'Disable environment');
        await screen.findByText('Disable environment when');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
        expect(requests).toMatchObject([defaultSafeguardPayload]);
    });

    test('should add feature env safeguard via change request when enabled', async () => {
        const user = userEvent.setup();
        enableChangeRequests();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/environments/production/change-requests',
            {},
            'post',
        );

        const { onSafeguardChange } = renderSection();

        await selectSafeguardType(user, 'Disable environment');
        await screen.findByText('Disable environment when');

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
                action: 'changeFeatureEnvSafeguard',
                payload: {
                    safeguard: defaultSafeguardPayload,
                },
            },
        ]);
    });

    test('should dismiss form when cancelling CR dialog during create', async () => {
        const user = userEvent.setup();
        enableChangeRequests();

        renderSection();

        await selectSafeguardType(user, 'Disable environment');
        await screen.findByText('Disable environment when');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await screen.findByText('Add suggestion to draft');
        const cancelButton = await screen.findByRole('button', {
            name: 'Cancel',
        });
        await user.click(cancelButton);

        await waitFor(() => {
            expect(
                screen.queryByText('Disable environment when'),
            ).not.toBeInTheDocument();
        });
        await screen.findByText('Add safeguard');
    });

    test('should add release plan safeguard via API', async () => {
        const user = userEvent.setup();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/release-plans/plan-1/safeguards',
            {},
            'put',
        );

        const { onSafeguardChange } = renderSection();

        await selectSafeguardType(user, 'Pause automation');
        await screen.findByText('Pause automation when');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
        expect(requests).toMatchObject([defaultSafeguardPayload]);
    });

    test('should delete existing release plan safeguard', async () => {
        const user = userEvent.setup();
        testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/release-plans/plan-1/safeguards/safeguard-1',
            {},
            'delete',
        );

        const { onSafeguardChange } = renderSection({ releasePlanSafeguard });

        await screen.findByText('Pause automation when');
        await deleteSafeguard(user);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
    });

    test('should delete feature env safeguard via change request', async () => {
        const user = userEvent.setup();
        enableChangeRequests();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/environments/production/change-requests',
            {},
            'post',
        );

        const { onSafeguardChange } = renderSection({ featureEnvSafeguard });

        await screen.findByText('Disable environment when');
        await deleteSafeguard(user, 'Add suggestion to draft');

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
        expect(requests).toMatchObject([
            {
                feature: 'feature1',
                action: 'deleteFeatureEnvSafeguard',
                payload: {
                    safeguardId: 'env-safeguard-1',
                },
            },
        ]);
    });

    test('should delete existing feature env safeguard', async () => {
        const user = userEvent.setup();
        testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/safeguards/env-safeguard-1',
            {},
            'delete',
        );

        const { onSafeguardChange } = renderSection({ featureEnvSafeguard });

        await screen.findByText('Disable environment when');
        await deleteSafeguard(user);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
    });

    test('should add release plan safeguard via change request', async () => {
        const user = userEvent.setup();
        enableChangeRequests();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/environments/production/change-requests',
            {},
            'post',
        );

        const { onSafeguardChange } = renderSection();

        await selectSafeguardType(user, 'Pause automation');
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
                action: 'changeReleasePlanSafeguard',
                payload: {
                    planId: 'plan-1',
                    safeguard: defaultSafeguardPayload,
                },
            },
        ]);
    });

    test('should delete release plan safeguard via change request', async () => {
        const user = userEvent.setup();
        enableChangeRequests();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/environments/production/change-requests',
            {},
            'post',
        );

        const { onSafeguardChange } = renderSection({ releasePlanSafeguard });

        await screen.findByText('Pause automation when');
        await deleteSafeguard(user, 'Add suggestion to draft');

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
        expect(requests).toMatchObject([
            {
                feature: 'feature1',
                action: 'deleteReleasePlanSafeguard',
                payload: {
                    planId: 'plan-1',
                    safeguardId: 'safeguard-1',
                },
            },
        ]);
    });
});
