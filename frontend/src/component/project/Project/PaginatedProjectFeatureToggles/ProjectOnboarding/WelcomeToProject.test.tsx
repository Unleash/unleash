import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { WelcomeToProject } from './WelcomeToProject';
import { screen } from '@testing-library/react';
import { ProjectFeatureToggles } from '../ProjectFeatureToggles';

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
                element={<WelcomeToProject projectId={projectId} />}
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    await screen.findByText('The project currently holds no feature toggles.');
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
                element={<WelcomeToProject projectId={projectId} />}
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    await screen.findByText(
        'Your project is not yet connected to any SDK. In order to start using your feature flag connect an SDK to the project.',
    );
});

test('Project is onboarded', async () => {
    const projectId = 'default';
    testServerRoute(server, '/api/admin/projects/default/overview', {
        onboardingStatus: {
            status: 'onboarded',
        },
    });
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            onboardingUI: true,
        },
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={<ProjectFeatureToggles environments={[]} />}
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    expect(
        screen.queryByText('Welcome to your project'),
    ).not.toBeInTheDocument();
});

test('Project is not onboarded', async () => {
    const projectId = 'default';
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            onboardingUI: true,
        },
    });
    testServerRoute(server, '/api/admin/projects/default/overview', {
        onboardingStatus: {
            status: 'onboarding-started',
        },
    });
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={<ProjectFeatureToggles environments={[]} />}
            />
        </Routes>,
        {
            route: `/projects/${projectId}`,
        },
    );
    await screen.findByText('Welcome to your project');
});
