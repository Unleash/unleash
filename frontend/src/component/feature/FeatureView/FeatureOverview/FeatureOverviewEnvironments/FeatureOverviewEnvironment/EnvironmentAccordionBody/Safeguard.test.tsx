import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import {
    ReleasePlanSafeguardSection,
    FeatureEnvironmentSafeguardSection,
    AddSafeguard,
    SafeguardSection,
} from './Safeguard.tsx';
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

const ReleasePlanComponent = ({
    safeguard,
    onSafeguardChange,
    onCancel,
}: {
    safeguard?: ISafeguard;
    onSafeguardChange: () => void;
    onCancel?: () => void;
}) => (
    <Routes>
        <Route
            path='/projects/:projectId/features/:featureId'
            element={
                <ReleasePlanSafeguardSection
                    releasePlan={releasePlan}
                    safeguard={safeguard}
                    environmentName='production'
                    featureId='feature1'
                    onSafeguardChange={onSafeguardChange}
                    onCancel={onCancel}
                />
            }
        />
    </Routes>
);

const FeatureEnvComponent = ({
    safeguard,
    onSafeguardChange,
    onCancel,
}: {
    safeguard?: ISafeguard;
    onSafeguardChange: () => void;
    onCancel?: () => void;
}) => (
    <Routes>
        <Route
            path='/projects/:projectId/features/:featureId'
            element={
                <FeatureEnvironmentSafeguardSection
                    safeguard={safeguard}
                    environmentName='production'
                    featureId='feature1'
                    onSafeguardChange={onSafeguardChange}
                    onCancel={onCancel}
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

describe('ReleasePlanSafeguardSection', () => {
    test('should show create form and send data to API', async () => {
        const user = userEvent.setup();
        const onSafeguardChange = vi.fn();

        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/release-plans/plan-1/safeguards',
            {},
            'put',
        );

        render(<ReleasePlanComponent onSafeguardChange={onSafeguardChange} />, {
            route: '/projects/default/features/feature1',
            permissions,
        });

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
            <ReleasePlanComponent
                safeguard={releasePlanSafeguard}
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

        render(<ReleasePlanComponent onSafeguardChange={onSafeguardChange} />, {
            route: '/projects/default/features/feature1',
            permissions,
        });

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
            <ReleasePlanComponent
                safeguard={releasePlanSafeguard}
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

describe('FeatureEnvironmentSafeguardSection', () => {
    test('should display existing safeguard', async () => {
        const onSafeguardChange = vi.fn();

        render(
            <FeatureEnvComponent
                safeguard={featureEnvSafeguard}
                onSafeguardChange={onSafeguardChange}
            />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        await screen.findByText('Disable environment when');
    });

    test('should show create form when rendered without safeguard', async () => {
        const onSafeguardChange = vi.fn();

        render(<FeatureEnvComponent onSafeguardChange={onSafeguardChange} />, {
            route: '/projects/default/features/feature1',
            permissions,
        });

        await screen.findByText('Disable environment when');
    });

    test('should delete safeguard', async () => {
        const user = userEvent.setup();
        const onSafeguardChange = vi.fn();

        testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/safeguards/env-safeguard-1',
            {},
            'delete',
        );

        render(
            <FeatureEnvComponent
                safeguard={featureEnvSafeguard}
                onSafeguardChange={onSafeguardChange}
            />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        await screen.findByText('Disable environment when');

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
});

describe('AddSafeguard', () => {
    test('should show type menu when featureEnv is enabled', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(
            <AddSafeguard
                onSelect={onSelect}
                showFeatureEnv={true}
                hasReleasePlan={true}
            />,
            { route: '/', permissions },
        );

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        await screen.findByText('Disable environment');
        await screen.findByText('Pause automation');
    });

    test('should call onSelect with chosen type', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(
            <AddSafeguard
                onSelect={onSelect}
                showFeatureEnv={true}
                hasReleasePlan={true}
            />,
            { route: '/', permissions },
        );

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        const menuItem = await screen.findByText('Disable environment');
        await user.click(menuItem);

        expect(onSelect).toHaveBeenCalledWith('featureEnvironment');
    });

    test('should disable pause automation when no release plan', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(
            <AddSafeguard
                onSelect={onSelect}
                showFeatureEnv={true}
                hasReleasePlan={false}
            />,
            { route: '/', permissions },
        );

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

        render(
            <AddSafeguard
                onSelect={onSelect}
                showFeatureEnv={false}
                hasReleasePlan={true}
            />,
            { route: '/', permissions },
        );

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        expect(onSelect).toHaveBeenCalledWith('releasePlan');
    });

    test('should render nothing when no types available', () => {
        const onSelect = vi.fn();

        render(
            <AddSafeguard
                onSelect={onSelect}
                showFeatureEnv={false}
                hasReleasePlan={false}
            />,
            { route: '/', permissions },
        );

        expect(screen.queryByText('Add safeguard')).not.toBeInTheDocument();
    });
});

describe('SafeguardSection', () => {
    const SafeguardSectionComponent = ({
        featureEnvSafeguard,
        releasePlanSafeguard,
        showFeatureEnvOption = true,
        onSafeguardChange,
    }: {
        featureEnvSafeguard?: ISafeguard;
        releasePlanSafeguard?: ISafeguard;
        showFeatureEnvOption?: boolean;
        onSafeguardChange: () => void;
    }) => (
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId'
                element={
                    <SafeguardSection
                        featureEnvSafeguard={featureEnvSafeguard}
                        releasePlan={releasePlan}
                        releasePlanSafeguard={releasePlanSafeguard}
                        environmentName='production'
                        featureId='feature1'
                        onSafeguardChange={onSafeguardChange}
                        showFeatureEnvOption={showFeatureEnvOption}
                    />
                }
            />
        </Routes>
    );

    test('should show one Add safeguard button when both types available', async () => {
        const onSafeguardChange = vi.fn();

        render(
            <SafeguardSectionComponent onSafeguardChange={onSafeguardChange} />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        const buttons = await screen.findAllByText('Add safeguard');
        expect(buttons).toHaveLength(1);
    });

    test('should show existing feature env safeguard instead of button', async () => {
        const onSafeguardChange = vi.fn();

        render(
            <SafeguardSectionComponent
                featureEnvSafeguard={featureEnvSafeguard}
                onSafeguardChange={onSafeguardChange}
            />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        await screen.findByText('Disable environment when');
        expect(screen.queryByText('Add safeguard')).not.toBeInTheDocument();
    });

    test('should show existing release plan safeguard instead of button', async () => {
        const onSafeguardChange = vi.fn();

        render(
            <SafeguardSectionComponent
                releasePlanSafeguard={releasePlanSafeguard}
                onSafeguardChange={onSafeguardChange}
            />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        await screen.findByText('Pause automation when');
        expect(screen.queryByText('Add safeguard')).not.toBeInTheDocument();
    });

    test('should open form after selecting type from menu', async () => {
        const user = userEvent.setup();
        const onSafeguardChange = vi.fn();

        render(
            <SafeguardSectionComponent onSafeguardChange={onSafeguardChange} />,
            {
                route: '/projects/default/features/feature1',
                permissions,
            },
        );

        const addButton = await screen.findByText('Add safeguard');
        await user.click(addButton);

        const menuItem = await screen.findByText('Disable environment');
        await user.click(menuItem);

        await screen.findByText('Disable environment when');
    });
});
