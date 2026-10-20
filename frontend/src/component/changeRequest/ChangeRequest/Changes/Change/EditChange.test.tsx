import { beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions';
import type { IChangeRequestUpdateStrategy } from 'component/changeRequest/changeRequest.types';
import {
    setupContextEndpoint,
    setupFeaturesEndpoint,
    setupProjectEndpoint,
    setupSegmentsEndpoint,
    setupStrategyEndpoint,
    setupUiConfigEndpoint,
} from 'component/feature/FeatureStrategy/FeatureStrategyCreate/featureStrategyFormTestSetup.ts';
import { EditChange } from './EditChange.tsx';

const featureName = 'my-new-feature';

const strategy = {
    name: 'flexibleRollout',
    parameters: { rollout: '50', stickiness: 'default', groupId: featureName },
    constraints: [],
    segments: [],
    variants: [],
};

const author = { id: 1, username: 'admin', imageUrl: '' };

const updateStrategyChange: IChangeRequestUpdateStrategy = {
    id: 1,
    action: 'updateStrategy',
    payload: { ...strategy, id: '1' },
    createdAt: new Date(),
    createdBy: author,
};

const renderEditor = (change: IChangeRequestUpdateStrategy) =>
    render(
        <Routes>
            <Route
                path='/projects/:projectId/change-requests/:id'
                element={
                    <EditChange
                        change={change}
                        changeRequestId={1}
                        featureId={featureName}
                        environment='development'
                        open
                        onSubmit={() => {}}
                        onClose={() => {}}
                    />
                }
            />
        </Routes>,
        {
            route: '/projects/default/change-requests/1',
            permissions: [
                {
                    permission: UPDATE_FEATURE_STRATEGY,
                    project: 'default',
                    environment: 'development',
                },
            ],
        },
    );

beforeEach(() => {
    setupProjectEndpoint();
    setupSegmentsEndpoint();
    setupStrategyEndpoint();
    setupFeaturesEndpoint(featureName);
    setupContextEndpoint(['default']);
    setupUiConfigEndpoint();
});

test('editing a strategy change warns when that strategy changes on the flag', async () => {
    renderEditor(updateStrategyChange);
    await screen.findByText('Gradual rollout');

    setupFeaturesEndpoint(featureName, 'Blue', {
        rollout: '75',
        description: 'changed elsewhere on the flag',
    });

    await screen.findByText('Your data is stale');
    expect(screen.getByText(/rollout: "75"/)).toBeInTheDocument();
    expect(
        screen.queryByText(/changed elsewhere on the flag/),
    ).not.toBeInTheDocument();
});
