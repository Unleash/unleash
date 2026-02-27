import { render } from 'utils/testRenderer';
import { StrategyChange } from './StrategyChange.tsx';
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

const milestoneStrategy = {
    name: 'flexibleRollout',
    constraints: [],
    variants: [],
    parameters: {
        rollout: '50',
        stickiness: 'default',
        groupId: 'test123',
    },
    segments: [],
    id: '8e25e369-6424-4dad-b17f-5d32ccftfetds',
    milestoneId: 'milestone-1',
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
                    releasePlans: [
                        {
                            id: 'release-plan-1',
                            milestones: [
                                {
                                    id: 'milestone-1',
                                    strategies: [
                                        {
                                            ...milestoneStrategy,
                                            variants: [
                                                {
                                                    name: 'current_variant',
                                                    weight: 1000,
                                                    stickiness: 'default',
                                                    weightType:
                                                        'variable' as const,
                                                },
                                            ],
                                            title: 'current_title',
                                            parameters: {
                                                ...milestoneStrategy.parameters,
                                                rollout: currentRollout,
                                            },
                                        },
                                    ],
                                },
                            ],
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

    await screen.findByText('Editing strategy');
    await screen.findByText('change_request_title');
    await screen.findByText('current_title');
    expect(screen.queryByText('snapshot_title')).not.toBeInTheDocument();

    await screen.findByText('Updating strategy variants to:');
    const variants = await screen.findAllByText('change_variant');
    expect(variants).toHaveLength(2);

    const viewDiff = await screen.findByRole('tab', {
        name: 'View diff',
    });
    await userEvent.click(viewDiff);

    const rollout = await screen.findByText(`rollout: "${currentRollout}"`);
    expect(rollout).toHaveClass('deletion');
    const oldName = await screen.findByText('name: "current_variant"');
    expect(oldName).toHaveClass('deletion');
    const newName = await screen.findByText('name: "change_variant"');
    expect(newName).toHaveClass('addition');
});

test('Editing milestone strategy before change request is applied diffs against current milestone strategy', async () => {
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
                            action: 'updateMilestoneStrategy',
                            id: 1,
                            payload: {
                                id: milestoneStrategy.id,
                                constraints: milestoneStrategy.constraints,
                                segments: milestoneStrategy.segments,
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
                                    ...milestoneStrategy.parameters,
                                    rollout: changeRequestRollout,
                                },
                                snapshot: {
                                    ...milestoneStrategy,
                                    title: 'snapshot_title',
                                    parameters: {
                                        ...milestoneStrategy.parameters,
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

    await screen.findByText('Editing strategy');
    await screen.findByText('change_request_title');
    await screen.findByText('current_title');
    expect(screen.queryByText('snapshot_title')).not.toBeInTheDocument();

    await screen.findByText('Updating strategy variants to:');
    const variants = await screen.findAllByText('change_variant');
    expect(variants).toHaveLength(2);

    const viewDiff = await screen.findByRole('tab', {
        name: 'View diff',
    });
    await userEvent.click(viewDiff);

    const rollout = await screen.findByText(`rollout: "${currentRollout}"`);
    expect(rollout).toHaveClass('deletion');
    const oldName = await screen.findByText('name: "current_variant"');
    expect(oldName).toHaveClass('deletion');
    const newName = await screen.findByText('name: "change_variant"');
    expect(newName).toHaveClass('addition');
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

    await screen.findByText('Editing strategy');
    await screen.findByText('change_request_title');
    await screen.findByText('snapshot_title');
    expect(screen.queryByText('current_title')).not.toBeInTheDocument();

    await screen.findByText('Updating strategy variants to:');
    const variants = await screen.findAllByText('change_variant');
    expect(variants).toHaveLength(2);

    const viewDiff = await screen.findByRole('tab', {
        name: 'View diff',
    });
    await userEvent.click(viewDiff);

    const oldRollout = await screen.findByText(`rollout: "${snapshotRollout}"`);
    expect(oldRollout).toHaveClass('deletion');
    const newRollout = await screen.findByText(
        `rollout: "${changeRequestRollout}"`,
    );

    expect(newRollout).toHaveClass('addition');
    const oldName = await screen.findByText('name: "snapshot_variant"');
    expect(oldName).toHaveClass('deletion');
    const newName = await screen.findByText('name: "change_variant"');
    expect(newName).toHaveClass('addition');
});

test('Editing milestone strategy after change request is applied diffs against the snapshot', async () => {
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
                            action: 'updateMilestoneStrategy',
                            id: 1,
                            payload: {
                                id: milestoneStrategy.id,
                                constraints: milestoneStrategy.constraints,
                                segments: milestoneStrategy.segments,
                                title: 'change_request_title',
                                parameters: {
                                    ...milestoneStrategy.parameters,
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
                                    ...milestoneStrategy,
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
                                        ...milestoneStrategy.parameters,
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

    await screen.findByText('Editing strategy');
    await screen.findByText('change_request_title');
    await screen.findByText('snapshot_title');
    expect(screen.queryByText('current_title')).not.toBeInTheDocument();

    await screen.findByText('Updating strategy variants to:');
    const variants = await screen.findAllByText('change_variant');
    expect(variants).toHaveLength(2);

    const viewDiff = await screen.findByRole('tab', {
        name: 'View diff',
    });
    await userEvent.click(viewDiff);

    const oldRollout = await screen.findByText(`rollout: "${snapshotRollout}"`);
    expect(oldRollout).toHaveClass('deletion');
    const newRollout = await screen.findByText(
        `rollout: "${changeRequestRollout}"`,
    );

    expect(newRollout).toHaveClass('addition');
    const oldName = await screen.findByText('name: "snapshot_variant"');
    expect(oldName).toHaveClass('deletion');
    const newName = await screen.findByText('name: "change_variant"');
    expect(newName).toHaveClass('addition');
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

    await screen.findByText('Deleting strategy');
    await screen.findByText('current_title');

    await screen.findByText('current_variant');

    const viewDiff = await screen.findByRole('tab', {
        name: 'View diff',
    });
    await userEvent.click(viewDiff);
    const element = await screen.findByText('name: "flexibleRollout"');
    expect(element).toHaveClass('deletion');
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

    await screen.findByText('Deleting strategy');
    await screen.findByText('snapshot_title');
    expect(screen.queryByText('current_title')).not.toBeInTheDocument();

    await screen.findByText('snapshot_variant');

    const viewDiff = await screen.findByRole('tab', {
        name: 'View diff',
    });
    await userEvent.click(viewDiff);

    const element = await screen.findByText('name: "snapshot_variant"');
    expect(element).toHaveClass('deletion');
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

    await screen.findByText('Adding strategy');
    await screen.findByText('change_request_title');

    const variants = await screen.findAllByText('change_variant');
    expect(variants).toHaveLength(2);

    const viewDiff = await screen.findByRole('tab', {
        name: 'View diff',
    });
    await userEvent.click(viewDiff);

    const element = await screen.findByText('name: "flexibleRollout"');
    expect(element).toHaveClass('addition');
});

test('Segments order does not matter for diff calculation', async () => {
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
                            action: 'updateStrategy',
                            id: 1,
                            payload: {
                                ...strategy,
                                segments: [3, 2, 1],
                                snapshot: {
                                    ...strategy,
                                    segments: [1, 2, 3],
                                },
                            },
                        }}
                    />
                }
            />
        </Routes>,
        { route: `/projects/${projectId}` },
    );

    const viewDiff = await screen.findByRole('tab', {
        name: 'View diff',
    });
    await userEvent.click(viewDiff);

    const segmentsChangeElement = screen.queryByText('segments: [');
    expect(segmentsChangeElement).not.toBeInTheDocument();
});
