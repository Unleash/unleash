import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import FeatureSettingsProjectConfirm from './FeatureSettingsProjectConfirm.tsx';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {});
};

test('Cannot change project for feature with dependencies', async () => {
    let closed = false;
    setupApi();
    render(
        <Routes>
            <Route
                path={'/projects/:projectId/features/:featureId/settings'}
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
        </Routes>,
        {
            route: '/projects/default/features/parent/settings',
        },
    );

    await screen.findByText('Please remove feature dependencies first.');

    const closeButton = await screen.findByText('Close');
    userEvent.click(closeButton);

    await waitFor(() => {
        expect(closed).toBe(true);
    });
});
