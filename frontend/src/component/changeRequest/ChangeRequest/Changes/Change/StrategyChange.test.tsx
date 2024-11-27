import { render } from 'utils/testRenderer';
import { StrategyChange } from './StrategyChange';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
        />,
    );

    await screen.findByText('Editing strategy:');
    await screen.findByText('change_request_title');
    await screen.findByText('current_title');
    expect(screen.queryByText('snapshot_title')).not.toBeInTheDocument();

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText(`- parameters.rollout: "${currentRollout}"`);
    await screen.findByText(`+ parameters.rollout: "${changeRequestRollout}"`);
});

test('Editing strategy after change request is applied diffs against the snapshot', async () => {
    render(
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
        />,
    );

    await screen.findByText('Editing strategy:');
    await screen.findByText('change_request_title');
    await screen.findByText('snapshot_title');
    expect(screen.queryByText('current_title')).not.toBeInTheDocument();

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText(`- parameters.rollout: "${snapshotRollout}"`);
    await screen.findByText(`+ parameters.rollout: "${changeRequestRollout}"`);
});

test('Deleting strategy before change request is applied diffs against current strategy', async () => {
    render(
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
        />,
    );

    await screen.findByText('- Deleting strategy:');
    await screen.findByText('Gradual rollout');
    await screen.findByText('current_title');

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText('- constraints (deleted)');
});

test('Deleting strategy before change request is applied diffs against the snapshot', async () => {
    render(
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
                        title: 'snapshot_title',
                        parameters: {
                            ...strategy.parameters,
                            rollout: snapshotRollout,
                        },
                    },
                },
            }}
        />,
    );

    await screen.findByText('- Deleting strategy:');
    await screen.findByText('Gradual rollout');
    await screen.findByText('snapshot_title');
    expect(screen.queryByText('current_title')).not.toBeInTheDocument();

    const viewDiff = await screen.findByText('View Diff');
    await userEvent.hover(viewDiff);
    await screen.findByText('- constraints (deleted)');
});
