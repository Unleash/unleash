import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import FlagProvider from '@unleash/proxy-client-react';
import { render, settleProviders } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { testUnleashClient } from 'utils/testUnleashClient';
import { WelcomeDialogProvider } from './personalDashboard/WelcomeDialogProvider.tsx';
import { App } from './App';
// Preload the lazy uxtweak chunk so the anonymous test's absence assertion
// can't pass by racing React.lazy — with the module already in the cache,
// a settled tree really has rendered everything it ever would.
import './uxtweak/UxTweakRunner.tsx';

const server = testServerSetup();

const setupLoggedIn = () => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1, name: 'Test User', email: 'test@test.com' },
        permissions: [],
        feedback: [],
        splash: {},
    });
};

const setupLoggedOut = () => {
    testServerRoute(server, '/api/admin/user', {
        type: 'password',
        path: '/auth/simple/login',
        message: '',
        defaultHidden: false,
        options: [],
    });
};

const setupSharedRoutes = (flags: object = { uxTweakSurveys: true }) => {
    testServerRoute(server, '/api/admin/ui-config', { flags });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
};

const everyPageSurveyFlag = {
    name: 'uxtweak-survey-all-abc1',
    enabled: true,
    impressionData: false,
    variant: {
        name: 'config',
        enabled: true,
        feature_enabled: true,
        payload: {
            type: 'json',
            value: JSON.stringify({
                v: 1,
                surveyId: 'sv_1',
                page: '*',
                title: 'Quick feedback',
                intro: '',
                questions: [
                    {
                        id: 'q1',
                        type: 'rating',
                        prompt: 'Rate this page',
                        required: true,
                    },
                ],
                submitBase: 'https://uxtweak.example.com',
            }),
        },
    },
};

const renderApp = (route: string) =>
    render(
        <FlagProvider
            unleashClient={testUnleashClient([everyPageSurveyFlag])}
            startClient={false}
        >
            <WelcomeDialogProvider>
                <App />
            </WelcomeDialogProvider>
        </FlagProvider>,
        { route },
    );

describe('App research widget gating', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('shows no research widgets before the user logs in', async () => {
        setupSharedRoutes();
        setupLoggedOut();
        renderApp('/login');

        await waitFor(() =>
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(),
        );
        await settleProviders();
        await settleProviders();
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
    });

    it('shows a matching survey once the user is logged in', async () => {
        setupSharedRoutes();
        setupLoggedIn();
        renderApp('/login');

        expect(await screen.findByText('Quick feedback')).toBeInTheDocument();
    });

    it('shows no research widgets when the uxTweakSurveys flag is off', async () => {
        setupSharedRoutes({});
        setupLoggedIn();
        renderApp('/login');

        await waitFor(() =>
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(),
        );
        await settleProviders();
        await settleProviders();
        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
    });
});
