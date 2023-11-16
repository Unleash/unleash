import { screen } from '@testing-library/react';

import { Route, Routes } from 'react-router-dom';

import { render } from 'utils/testRenderer';
import { ChangeRequest } from './ChangeRequest';
import {
    IChangeRequest,
    IChangeRequestAddStrategy,
    IChangeRequestEnabled,
} from '../changeRequest.types';
import { vi } from 'vitest';
import { useCurrentStrategy } from './Changes/Change/hooks/useCurrentStrategy';
import { IFeatureStrategy } from 'interfaces/strategy';

vi.mock('./Changes/Change/hooks/useCurrentStrategy', () => ({
    useCurrentStrategy: vi.fn(),
}));

afterEach(() => {
    vi.restoreAllMocks();
});

const changeRequestWithDefaultChange = (
    defaultChange: IChangeRequestEnabled | IChangeRequestAddStrategy,
) => {
    const changeRequest: IChangeRequest = {
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
                name: 'FeatureToggleName',
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
        project: 'project',
        environment: 'production',
    };
    return changeRequest;
};

const changeRequest = () => {
    const changeRequest: IChangeRequest = {
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
                name: 'FeatureToggleName',
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
                    },
                ],
            },
        ],
        id: 0,
        minApprovals: 1,
        state: 'Draft',
        title: 'My change request',
        project: 'project',
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

    expect(screen.getByText('FeatureToggleName')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(
        screen.getByText('Default strategy will be added'),
    ).toBeInTheDocument();
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

    expect(screen.getByText('FeatureToggleName')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Feature status will change')).toBeInTheDocument();
});

test('Displays feature strategy variants table when addStrategy action with variants', async () => {
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
            route: 'projects/default/features/FeatureToggleName/strategies/edit?environmentId=development&strategyId=2e4f0555-518b-45b3-b0cd-a32cca388a92',
        },
    );

    expect(
        screen.getByText('Updating feature variants to:'),
    ).toBeInTheDocument();
});

test('Displays feature strategy variants table when there is a change in the variants array', async () => {
    vi.mocked(useCurrentStrategy).mockReturnValueOnce({
        id: '2e4f0555-518b-45b3-b0cd-a32cca388a92',
        variants: [
            {
                name: 'variant1',
                stickiness: 'default',
                weight: 500,
                weightType: 'fix',
            },
        ],
    } as unknown as IFeatureStrategy);
    render(
        <Routes>
            <Route
                path={'projects/:projectId/features/:featureId/strategies/edit'}
                element={<ChangeRequest changeRequest={changeRequest()} />}
            />
        </Routes>,
        {
            route: 'projects/default/features/FeatureToggleName/strategies/edit?environmentId=development&strategyId=2e4f0555-518b-45b3-b0cd-a32cca388a92',
        },
    );
    await screen.findByText('Updating feature variants to:');
});

test('Does not display feature strategy variants table when there is no changes in the variants array', async () => {
    vi.mocked(useCurrentStrategy).mockReturnValueOnce({
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
    } as unknown as IFeatureStrategy);

    render(
        <Routes>
            <Route
                path={'projects/:projectId/features/:featureId/strategies/edit'}
                element={<ChangeRequest changeRequest={changeRequest()} />}
            />
        </Routes>,
        {
            route: 'projects/default/features/FeatureToggleName/strategies/edit?environmentId=development&strategyId=2e4f0555-518b-45b3-b0cd-a32cca388a92',
        },
    );

    expect(
        await screen.queryByText('Updating feature variants to:'),
    ).toBeNull();
});
