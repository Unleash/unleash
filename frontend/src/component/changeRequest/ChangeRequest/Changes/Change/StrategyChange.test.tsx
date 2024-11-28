import { render } from 'utils/testRenderer';
import { StrategyChange } from './StrategyChange';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

const server = testServerSetup();

const feature = 'my_feature';
const projectId = 'default';
const environmentName = 'production';
const snapshotRollout = '70';
const currentRollout = '80';
const changeRequestRollout = '90';
const strategy = {
    name: 'flexibleRollout',
    constraints: [],
    variants: [],
    parameters: {
        groupId: 'child_1',
        stickiness: 'default',
    },
    segments: [],
    id: '8e25e369-6424-4dad-b17f-5d32cceb2fbe',
    disabled: false,
};

const setupApi = () => {
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/features/${feature}`,
        {
            environments: [
                {
                    name: environmentName,

                    strategies: [
                        {
                            ...strategy,
                            variants: [
                                {
                                    name: 'current_variant',
                                    weight: 1000,
                                    stickiness: 'default',
                                    weightType: 'variable' as const,
                                },
                            ],
                            title: 'current_title',
                            parameters: {
                                ...strategy.parameters,
                                rollout: currentRollout,
                            },
                        },
                    ],
                },
            ],
        },
    );
};

beforeEach(setupApi);

test('Editing strategy before change request is applied diffs against current strategy', async () => {
    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={
                    <StrategyChange
                        featureName={feature}
                        environmentName={environmentName}
                        projectId={projectId}
                        changeRequestState='Approved'
                        change={{
                            action: 'updateStrategy',
                            id: 1,
                            payload: {
                                ...strategy,
                                variants: [
                                    {
                                        name: 'change_variant',
                                        weight: 1000,
                                        stickiness: 'default',
                                        weightType: 'variable' as const,
                                    },
                                ],
                                title: 'change_request_title',
                                parameters: {
                                    ...strategy.parameters,
                                    rollout: changeRequestRollout,
                                },
                                snapshot: {
                                    ...strategy,
                                    title: 'snapshot_title',
                                    parameters: {
                                        ...strategy.parameters,
                                        rollout: snapshotRollout,
                                    },
                                },
                            },
                        }}
                    />
                }
            />
        </Routes>,
        { route: `/projects/${projectId}` },
    );

    await screen.findByText('Editing strategy:');
    await screen.findByText('change_request_title');
    await screen.findByText('current_title');
    expect(screen.queryByText('snapshot_title')).not.toBeInTheDocument();

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText(`- parameters.rollout: "${currentRollout}"`);
    await screen.findByText('- variants.0.name: "current_variant"');
    await screen.findByText('+ variants.0.name: "change_variant"');

    await screen.findByText('Updating strategy variants to:');
    await screen.findByText('change_variant');
});

test('Editing strategy after change request is applied diffs against the snapshot', async () => {
    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={
                    <StrategyChange
                        featureName='my_feature'
                        environmentName='production'
                        projectId='default'
                        changeRequestState='Applied'
                        change={{
                            action: 'updateStrategy',
                            id: 1,
                            payload: {
                                ...strategy,
                                title: 'change_request_title',
                                parameters: {
                                    ...strategy.parameters,
                                    rollout: changeRequestRollout,
                                },
                                variants: [
                                    {
                                        name: 'change_variant',
                                        weight: 1000,
                                        stickiness: 'default',
                                        weightType: 'variable' as const,
                                    },
                                ],
                                snapshot: {
                                    ...strategy,
                                    variants: [
                                        {
                                            name: 'snapshot_variant',
                                            weight: 1000,
                                            stickiness: 'default',
                                            weightType: 'variable' as const,
                                        },
                                    ],
                                    title: 'snapshot_title',
                                    parameters: {
                                        ...strategy.parameters,
                                        rollout: snapshotRollout,
                                    },
                                },
                            },
                        }}
                    />
                }
            />
        </Routes>,
        { route: `/projects/${projectId}` },
    );

    await screen.findByText('Editing strategy:');
    await screen.findByText('change_request_title');
    await screen.findByText('snapshot_title');
    expect(screen.queryByText('current_title')).not.toBeInTheDocument();

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText(`- parameters.rollout: "${snapshotRollout}"`);
    await screen.findByText(`+ parameters.rollout: "${changeRequestRollout}"`);
    await screen.findByText('- variants.0.name: "snapshot_variant"');
    await screen.findByText('+ variants.0.name: "change_variant"');

    await screen.findByText('Updating strategy variants to:');
    await screen.findByText('change_variant');
});

test('Deleting strategy before change request is applied diffs against current strategy', async () => {
    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={
                    <StrategyChange
                        featureName={feature}
                        environmentName={environmentName}
                        projectId={projectId}
                        changeRequestState='Approved'
                        change={{
                            action: 'deleteStrategy',
                            id: 1,
                            payload: {
                                id: strategy.id,
                                name: strategy.name,
                            },
                        }}
                    />
                }
            />
        </Routes>,
        { route: `/projects/${projectId}` },
    );

    await screen.findByText('- Deleting strategy:');
    await screen.findByText('Gradual rollout');
    await screen.findByText('current_title');

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText('- constraints (deleted)');

    await screen.findByText('Deleting strategy variants:');
    await screen.findByText('current_variant');
});

test('Deleting strategy after change request is applied diffs against the snapshot', async () => {
    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={
                    <StrategyChange
                        featureName={feature}
                        environmentName={environmentName}
                        projectId={projectId}
                        changeRequestState='Applied'
                        change={{
                            action: 'deleteStrategy',
                            id: 1,
                            payload: {
                                id: strategy.id,
                                // name is gone
                                snapshot: {
                                    ...strategy,
                                    variants: [
                                        {
                                            name: 'snapshot_variant',
                                            weight: 1000,
                                            stickiness: 'default',
                                            weightType: 'variable' as const,
                                        },
                                    ],
                                    title: 'snapshot_title',
                                    parameters: {
                                        ...strategy.parameters,
                                        rollout: snapshotRollout,
                                    },
                                },
                            },
                        }}
                    />
                }
            />
        </Routes>,
        { route: `/projects/${projectId}` },
    );

    await screen.findByText('- Deleting strategy:');
    await screen.findByText('Gradual rollout');
    await screen.findByText('snapshot_title');
    expect(screen.queryByText('current_title')).not.toBeInTheDocument();

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText('- constraints (deleted)');

    await screen.findByText('Deleting strategy variants:');
    await screen.findByText('snapshot_variant');
});

test('Adding strategy always diffs against undefined strategy', async () => {
    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={
                    <StrategyChange
                        featureName={feature}
                        environmentName={environmentName}
                        projectId={projectId}
                        changeRequestState='Approved'
                        change={{
                            action: 'addStrategy',
                            id: 1,
                            payload: {
                                ...strategy,
                                variants: [
                                    {
                                        name: 'change_variant',
                                        weight: 1000,
                                        stickiness: 'default',
                                        weightType: 'variable' as const,
                                    },
                                ],
                                title: 'change_request_title',
                                parameters: {
                                    ...strategy.parameters,
                                    rollout: changeRequestRollout,
                                },
                            },
                        }}
                    />
                }
            />
        </Routes>,
        { route: `/projects/${projectId}` },
    );

    await screen.findByText('+ Adding strategy:');
    await screen.findByText('change_request_title');

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText(`+ name: "flexibleRollout"`);

    await screen.findByText('Setting strategy variants to:');
    await screen.findByText('change_variant');
});
