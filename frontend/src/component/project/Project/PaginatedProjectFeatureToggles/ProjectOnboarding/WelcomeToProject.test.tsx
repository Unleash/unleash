import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { WelcomeToProject } from './WelcomeToProject';
import { screen } from '@testing-library/react';

const server = testServerSetup();

test('Project can start onboarding', async () => {
    const projectId = 'default';
    testServerRoute(server, '/api/admin/projects/default/overview', {
        onboarding: {
            onboardingStatus: 'onboarding-started',
        },
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <WelcomeToProject
                        projectId={projectId}
                        setConnectSdkOpen={() => {}}
                    />
                }
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    await screen.findByText('The project currently holds no feature flags.');
});

test('Project can connect SDK', async () => {
    const projectId = 'default';
    testServerRoute(server, '/api/admin/projects/default/overview', {
        onboardingStatus: {
            status: 'first-flag-created',
            feature: 'default-feature',
        },
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <WelcomeToProject
                        projectId={projectId}
                        setConnectSdkOpen={() => {}}
                    />
                }
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    await screen.findByText(
        'Your project is not yet connected to any SDK. To start using your feature flag, connect an SDK to the project.',
    );
});
