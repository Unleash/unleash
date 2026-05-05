import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ProjectOnboarding } from './ProjectOnboarding.tsx';
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
                    <ProjectOnboarding
                        projectId={projectId}
                        setConnectSdkOpen={() => {}}
                        setOnboardingFlow={() => {}}
                        refetchFeatures={() => {}}
                    />
                }
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    await screen.findByText('Project setup');
    await screen.findByText('Create a feature flag');
    await screen.findByText(
        'You must create a feature flag before you can connect a SDK.',
    );
    await screen.findByText('New feature flag');
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
                    <ProjectOnboarding
                        projectId={projectId}
                        setConnectSdkOpen={() => {}}
                        setOnboardingFlow={() => {}}
                        refetchFeatures={() => {}}
                    />
                }
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    await screen.findByText('Connect SDKs');
    await screen.findByText(
        'To start using your feature flag, connect an SDK to the project.',
    );
    await screen.findByText('Connect SDK');
});
