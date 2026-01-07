import { screen, waitFor } from '@testing-library/react';

import { Route, Routes } from 'react-router-dom';

import { render } from 'utils/testRenderer';
import { ChangeRequest } from './ChangeRequest.tsx';
import type {
    ChangeRequestType,
    IChangeRequestAddStrategy,
    IChangeRequestEnabled,
} from '../changeRequest.types';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { StrategyVariantSchema } from 'openapi';

const server = testServerSetup();
const uiConfigForEnterprise = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
    });

const featureWithStrategyVariants = () =>
    testServerRoute(server, `/api/admin/projects/default/features/feature1`, {
        name: 'feature1',
        impressionData: false,
        description: '',
        project: 'default',
        stale: false,
        variants: [],
        createdAt: '2022-11-14T08:16:33.338Z',
        lastSeenAt: null,
        type: 'release',
        archived: false,
        children: [],
        dependencies: [],
        environments: [
            {
                name: 'development',
                enabled: false,
                type: 'production',
                sortOrder: 1,
                strategies: [
                    {
                        id: '2e4f0555-518b-45b3-b0cd-a32cca388a92',
                        variants: [
                            {
                                name: 'variant1',
                                stickiness: 'default',
                                weight: 500,
                                weightType: 'fix',
                            },
                            {
                                name: 'variant2',
                                stickiness: 'default',
                                weight: 500,
                                weightType: 'fix',
                            },
                        ],
                    },
                ],
            },
        ],
    });

const feature = () =>
    testServerRoute(server, `/api/admin/projects/default/features/feature1`, {
        name: 'feature1',
        impressionData: false,
        description: '',
        project: 'default',
        stale: false,
        variants: [],
        createdAt: '2022-11-14T08:16:33.338Z',
        lastSeenAt: null,
        type: 'release',
        archived: false,
        children: [],
        dependencies: [],
        environments: [
            {
                name: 'development',
                enabled: false,
                type: 'production',
                sortOrder: 1,
                strategies: [
                    {
                        id: '2e4f0555-518b-45b3-b0cd-a32cca388a92',
                    },
                ],
            },
        ],
    });

const changeRequestWithDefaultChange = (
    defaultChange: IChangeRequestEnabled | IChangeRequestAddStrategy,
) => {
    const changeRequest: ChangeRequestType = {
        approvals: [],
        rejections: [],
        comments: [],
        createdAt: new Date(),
        createdBy: {
            id: 1,
            username: 'author',
            imageUrl: '',
        },
        segments: [],
        features: [
            {
                name: 'feature1',
                changes: [
                    {
                        id: 67,
                        action: 'updateEnabled',
                        payload: {
                            enabled: true,
                        },
                        createdAt: new Date(),
                        createdBy: {
                            id: 1,
                            username: 'admin',
                            imageUrl:
                                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
                        },
                    },
                ],
                defaultChange,
            },
        ],
        id: 0,
        minApprovals: 1,
        state: 'Draft',
        title: 'My change request',
        project: 'default',
        environment: 'production',
    };
    return changeRequest;
};

const changeRequest = (variants: StrategyVariantSchema[]) => {
    const changeRequest: ChangeRequestType = {
        approvals: [],
        rejections: [],
        comments: [],
        createdAt: new Date(),
        createdBy: {
            id: 1,
            username: 'author',
            imageUrl: '',
        },
        segments: [],
        features: [
            {
                name: 'feature1',
                changes: [
                    {
                        id: 0,
                        action: 'updateStrategy',
                        payload: {
                            id: '2e4f0555-518b-45b3-b0cd-a32cca388a92',
                            name: 'flexibleRollout',
                            constraints: [],
                            parameters: {
                                rollout: '100',
                                stickiness: 'default',
                                groupId: 'test123',
                            },
                            variants: variants,
                        },
                    },
                ],
            },
        ],
        id: 27,
        minApprovals: 1,
        state: 'Draft',
        title: 'My change request',
        project: 'default',
        environment: 'production',
    };
    return changeRequest;
};

test('Display default add strategy', async () => {
    render(
        <ChangeRequest
            changeRequest={changeRequestWithDefaultChange({
                id: 0,
                action: 'addStrategy',
                payload: {
                    name: 'flexibleRollout',
                    constraints: [],
                    parameters: {
                        rollout: '100',
                        stickiness: 'default',
                        groupId: 'test123',
                    },
                },
            })}
        />,
    );

    expect(screen.getByText('feature1')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Adding default strategy')).toBeInTheDocument();
});

test('Display default disable feature', async () => {
    render(
        <ChangeRequest
            changeRequest={changeRequestWithDefaultChange({
                id: 0,
                action: 'updateEnabled',
                payload: {
                    enabled: false,
                },
            })}
        />,
    );

    expect(screen.getByText('feature1')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Feature status will change')).toBeInTheDocument();
});

test('Displays strategy variant table when addStrategy action with variants', async () => {
    render(
        <Routes>
            <Route
                path={'projects/:projectId/features/:featureId/strategies/edit'}
                element={
                    <ChangeRequest
                        changeRequest={changeRequestWithDefaultChange({
                            id: 0,
                            action: 'addStrategy',
                            payload: {
                                name: 'flexibleRollout',
                                constraints: [],
                                parameters: {
                                    rollout: '100',
                                    stickiness: 'default',
                                    groupId: 'test123',
                                },
                                variants: [
                                    {
                                        name: 'variant1',
                                        stickiness: 'default',
                                        weight: 500,
                                        weightType: 'fix',
                                    },
                                    {
                                        name: 'variant2',
                                        stickiness: 'default',
                                        weight: 500,
                                        weightType: 'fix',
                                    },
                                ],
                            },
                        })}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default/features/feature1/strategies/edit',
        },
    );

    await screen.findByText('Adding strategy variants:');
});

test('Displays feature strategy variants table when there is a change in the variants array', async () => {
    uiConfigForEnterprise();
    featureWithStrategyVariants();
    render(
        <Routes>
            <Route
                path={'projects/:projectId/change-requests/:changeRequestId'}
                element={
                    <ChangeRequest
                        changeRequest={changeRequest([
                            {
                                name: 'variant1',
                                stickiness: 'default',
                                weight: 500,
                                weightType: 'fix',
                            },
                        ])}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default/change-requests/27',
        },
    );

    waitFor(async () => {
        await screen.findByText('Updating strategy variants to:');
    });
});

test('Displays feature strategy variants table when existing strategy does not have variants and change does', async () => {
    uiConfigForEnterprise();
    feature();
    render(
        <Routes>
            <Route
                path={'projects/:projectId/change-requests/:changeRequestId'}
                element={
                    <ChangeRequest
                        changeRequest={changeRequest([
                            {
                                name: 'variant1',
                                stickiness: 'default',
                                weight: 500,
                                weightType: 'fix',
                            },
                        ])}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default/change-requests/27',
        },
    );
    await screen.findByText('Adding strategy variants:');
});
