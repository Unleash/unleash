import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import {
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { Safeguard } from './Safeguard.tsx';
import type { ISafeguard } from 'interfaces/safeguard';
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
    {
        permission: UPDATE_FEATURE_ENVIRONMENT,
        project: 'default',
        environment: 'production',
    },
];

const releasePlanSafeguard: ISafeguard = {
    id: 'safeguard-1',
    action: { id: 'action-1', type: 'pause' },
    impactMetric: {
        id: 'metric-1',
        metricName: 'unleash_counter_http_requests_total',
        timeRange: 'day',
        aggregationMode: 'rps',
        labelSelectors: { appName: ['*'] },
    },
    triggerCondition: {
        operator: '>',
        threshold: 100,
    },
};

const releasePlanBase = {
    id: 'plan-1',
    name: 'Release Plan 1',
    description: '',
    createdAt: '',
    createdByUserId: 0,
    featureName: 'feature1',
    environment: 'production',
    milestones: [],
};

const releasePlan = { ...releasePlanBase, safeguards: [] as ISafeguard[] };
const releasePlanWithSafeguard = {
    ...releasePlanBase,
    safeguards: [releasePlanSafeguard],
};

const featureEnvSafeguard: ISafeguard = {
    id: 'env-safeguard-1',
    action: {
        id: 'action-2',
        type: 'disableFeatureEnvironment',
    },
    impactMetric: {
        id: 'metric-2',
        metricName: 'unleash_counter_http_requests_total',
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
        metricName: 'unleash_counter_http_requests_total',
        timeRange: 'day',
        aggregationMode: 'count',
        labelSelectors: {},
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
        impactMetrics: 'internal',
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
        metrics: [
            {
                name: 'unleash_counter_http_requests_total',
                help: 'Total HTTP requests',
                displayName: 'http_requests_total',
                source: 'internal',
            },
        ],
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

const openSafeguardForm = async (user: ReturnType<typeof userEvent.setup>) => {
    const addButton = await screen.findByText('Add safeguard');
    await user.click(addButton);

    return await screen.findByRole('combobox', { name: 'Safeguard action' });
};

const switchSafeguardType = async (
    user: ReturnType<typeof userEvent.setup>,
    optionLabel: string,
) => {
    const typeSelect = await screen.findByRole('combobox', {
        name: 'Safeguard action',
    });
    await user.click(typeSelect);
    const option = await screen.findByText(optionLabel);
    await user.click(option);

    await waitFor(() => {
        expect(typeSelect).toHaveTextContent(optionLabel);
    });
};

const selectSafeguardType = async (
    user: ReturnType<typeof userEvent.setup>,
    optionLabel: string,
) => {
    await openSafeguardForm(user);
    if (optionLabel === 'Disable environment') return;

    await switchSafeguardType(user, optionLabel);
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

describe('Safeguard', () => {
    const renderSection = (props?: {
        featureEnvSafeguard?: ISafeguard;
        releasePlan?: IReleasePlan;
    }) => {
        const onSafeguardChange = vi.fn();
        render(
            <Routes>
                <Route
                    path='/projects/:projectId/features/:featureId'
                    element={
                        <Safeguard
                            featureEnvSafeguard={props?.featureEnvSafeguard}
                            releasePlan={props?.releasePlan}
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
        renderSection({ releasePlan });

        const buttons = await screen.findAllByText('Add safeguard');
        expect(buttons).toHaveLength(1);
    });

    test('should open the form with disable environment preselected and explained', async () => {
        const user = userEvent.setup();
        renderSection({ releasePlan });

        const typeSelect = await openSafeguardForm(user);
        expect(typeSelect).toHaveTextContent('Disable environment');

        await user.click(typeSelect);
        await screen.findByText(
            'If your chosen metric crosses its threshold, this flag is turned off in this environment. Existing users stop seeing the flag immediately.',
        );
    });

    test('should require a release plan for the pause automation safeguard', async () => {
        const user = userEvent.setup();
        renderSection();

        const typeSelect = await openSafeguardForm(user);
        await user.click(typeSelect);

        const pauseOption = await screen.findByRole('option', {
            name: /Pause release plan automation/,
        });
        expect(pauseOption).toHaveAttribute('aria-disabled', 'true');
        await screen.findByText('Add a release plan to use this option');
    });

    test('should show existing feature env safeguard', async () => {
        renderSection({ featureEnvSafeguard, releasePlan });

        await screen.findByText('Disable environment when');
        expect(screen.queryByText('Add safeguard')).not.toBeInTheDocument();
    });

    test('should show existing release plan safeguard', async () => {
        renderSection({ releasePlan: releasePlanWithSafeguard });

        await screen.findByText('Pause automation when');
        expect(screen.queryByText('Add safeguard')).not.toBeInTheDocument();
    });

    test('should preserve aggregation mode when editing existing safeguard with unprefixed metric', async () => {
        const user = userEvent.setup();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/safeguards',
            {},
            'put',
        );

        testServerRoute(server, '/api/admin/impact-metrics/metadata', {
            metrics: [
                {
                    name: 'my_custom_metric',
                    help: 'A custom metric',
                    displayName: 'my_custom_metric',
                    source: 'external',
                },
            ],
        });
        testServerRoute(server, '/api/admin/impact-metrics/', {
            series: [],
            labels: { appName: [], metric_type: ['counter'] },
        });

        const existingSafeguard: ISafeguard = {
            id: 'env-safeguard-custom',
            action: {
                id: 'action-custom',
                type: 'disableFeatureEnvironment',
            },
            impactMetric: {
                id: 'metric-custom',
                metricName: 'my_custom_metric',
                timeRange: 'hour',
                aggregationMode: 'rps',
                labelSelectors: { appName: ['*'] },
                source: 'external',
            },
            triggerCondition: {
                operator: '>',
                threshold: 50,
            },
        };

        const { onSafeguardChange } = renderSection({
            featureEnvSafeguard: existingSafeguard,
        });

        await screen.findByText('Disable environment when');

        const thresholdInput = screen.getByDisplayValue('50');
        await user.clear(thresholdInput);
        await user.type(thresholdInput, '99');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
        expect(requests).toMatchObject([
            {
                impactMetric: {
                    metricName: 'my_custom_metric',
                    aggregationMode: 'rps',
                    timeRange: 'hour',
                    source: 'external',
                },
                triggerCondition: {
                    threshold: 99,
                },
            },
        ]);
    });

    test('should default to count aggregation when creating new safeguard with unprefixed counter metric', async () => {
        const user = userEvent.setup();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/safeguards',
            {},
            'put',
        );

        testServerRoute(server, '/api/admin/impact-metrics/metadata', {
            metrics: [
                {
                    name: 'my_custom_metric',
                    help: 'A custom metric',
                    displayName: 'my_custom_metric',
                    source: 'internal',
                },
            ],
        });
        testServerRoute(server, '/api/admin/impact-metrics/', {
            series: [],
            labels: { appName: [], metric_type: ['counter'] },
        });

        const { onSafeguardChange } = renderSection({ releasePlan });

        await selectSafeguardType(user, 'Disable environment');
        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
        expect(requests).toMatchObject([
            {
                impactMetric: {
                    metricName: 'my_custom_metric',
                    aggregationMode: 'count',
                },
            },
        ]);
    });

    const submitFeatureEnvSafeguard = async (
        metricLabels: Record<string, string[]>,
    ) => {
        const user = userEvent.setup();
        testServerRoute(server, '/api/admin/impact-metrics/', {
            series: [],
            labels: metricLabels,
        });
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/safeguards',
            {},
            'put',
        );

        const { onSafeguardChange } = renderSection({ releasePlan });

        await selectSafeguardType(user, 'Disable environment');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
        return requests as Array<typeof defaultSafeguardPayload>;
    };

    test('should exclude environment from labelSelectors when metric lacks environment label', async () => {
        const requests = await submitFeatureEnvSafeguard({
            appName: [],
        });
        expect(requests).toMatchObject([defaultSafeguardPayload]);
        expect(requests[0].impactMetric.labelSelectors).toEqual({});
    });

    test('should include environment in labelSelectors when metric has matching environment label', async () => {
        const requests = await submitFeatureEnvSafeguard({
            appName: [],
            environment: ['production', 'development'],
        });
        expect(requests).toMatchObject([
            {
                ...defaultSafeguardPayload,
                impactMetric: {
                    ...defaultSafeguardPayload.impactMetric,
                    labelSelectors: { environment: ['production'] },
                },
            },
        ]);
    });

    test('should include environment in labelSelectors even when metric environment values do not match current environment', async () => {
        const requests = await submitFeatureEnvSafeguard({
            appName: [],
            environment: ['staging', 'dev'],
        });
        expect(requests[0].impactMetric.labelSelectors).toEqual({
            environment: ['production'],
        });
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

        const { onSafeguardChange } = renderSection({ releasePlan });

        await selectSafeguardType(user, 'Disable environment');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await screen.findByText('Add suggestion to draft');
        expect(
            screen.getByText('unleash_counter_http_requests_total'),
        ).toBeInTheDocument();

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

        renderSection({ releasePlan });

        await selectSafeguardType(user, 'Disable environment');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await screen.findByText('Add suggestion to draft');
        const cancelButton = await screen.findByRole('button', {
            name: 'Cancel',
        });
        await user.click(cancelButton);

        await waitFor(() => {
            expect(
                screen.queryByRole('combobox', { name: 'Safeguard action' }),
            ).not.toBeInTheDocument();
        });
        await screen.findByText('Add safeguard');
    });

    test('should add release plan safeguard via API, keeping values entered before the type switch', async () => {
        const user = userEvent.setup();
        const { requests } = testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/release-plans/plan-1/safeguards',
            {},
            'put',
        );

        const { onSafeguardChange } = renderSection({ releasePlan });

        await openSafeguardForm(user);
        const thresholdInput = screen.getByDisplayValue('0');
        await user.clear(thresholdInput);
        await user.type(thresholdInput, '42');

        await switchSafeguardType(user, 'Pause release plan automation');

        const saveButton = await screen.findByText('Save');
        await user.click(saveButton);

        await waitFor(() => {
            expect(onSafeguardChange).toHaveBeenCalled();
        });
        expect(requests).toMatchObject([
            {
                ...defaultSafeguardPayload,
                triggerCondition: {
                    operator: '>',
                    threshold: 42,
                },
            },
        ]);
    });

    test('should delete existing release plan safeguard', async () => {
        const user = userEvent.setup();
        testServerRoute(
            server,
            '/api/admin/projects/default/features/feature1/environments/production/release-plans/plan-1/safeguards/safeguard-1',
            {},
            'delete',
        );

        const { onSafeguardChange } = renderSection({
            releasePlan: releasePlanWithSafeguard,
        });

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

        const { onSafeguardChange } = renderSection({
            featureEnvSafeguard,
            releasePlan,
        });

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

        const { onSafeguardChange } = renderSection({
            featureEnvSafeguard,
            releasePlan,
        });

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

        const { onSafeguardChange } = renderSection({ releasePlan });

        await selectSafeguardType(user, 'Pause release plan automation');

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

        const { onSafeguardChange } = renderSection({
            releasePlan: releasePlanWithSafeguard,
        });

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
