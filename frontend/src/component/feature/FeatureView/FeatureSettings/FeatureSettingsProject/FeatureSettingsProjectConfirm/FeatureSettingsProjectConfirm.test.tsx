import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import FeatureSettingsProjectConfirm from './FeatureSettingsProjectConfirm';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { UIProviderContainer } from '../../../../../providers/UIProvider/UIProviderContainer';
import { Route, Routes } from 'react-router-dom';
import React from 'react';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            dependentFeatures: true,
        },
    });
};

test('Cannot change project for feature with dependencies', async () => {
    let closed = false;
    setupApi();
    render(
        <UIProviderContainer>
            <Routes>
                <Route
                    path={'projects/:projectId/features/:featureId/settings'}
                    element={
                        <FeatureSettingsProjectConfirm
                            projectId={'newProjectId'}
                            feature={
                                {
                                    environments: [],
                                    dependencies: [],
                                    children: ['child'],
                                } as unknown as IFeatureToggle
                            }
                            onClose={() => {
                                closed = true;
                            }}
                            onClick={() => {}}
                            open={true}
                            changeRequests={[]}
                        />
                    }
                />
            </Routes>
        </UIProviderContainer>,
        {
            route: 'projects/default/features/parent/settings',
        },
    );

    await screen.findByText('Please remove feature dependencies first.');

    const closeButton = await screen.findByText('Close');
    userEvent.click(closeButton);

    await waitFor(() => {
        expect(closed).toBe(true);
    });
});
