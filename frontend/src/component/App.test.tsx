import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, onTestFinished } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { type ScopedMutator, useSWRConfig } from 'swr';
import FlagProvider from '@unleash/proxy-client-react';
import { render, settleProviders } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { testUnleashClient } from 'utils/testUnleashClient';
import { WelcomeDialogProvider } from './personalDashboard/WelcomeDialogProvider.tsx';
import { App } from './App';
import { UserSettingsProvider } from './userSettings/UserSettingsProvider.tsx';
import { serverBackedKeys } from './userSettings/serverBackedKeys.ts';
import { USER_ENDPOINT_PATH } from 'hooks/api/getters/useAuth/useAuthEndpoint';
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

const renderApp = (route: string, sibling?: ReactNode) =>
    render(
        <FlagProvider
            unleashClient={testUnleashClient([everyPageSurveyFlag])}
            startClient={false}
        >
            <WelcomeDialogProvider>
                <App />
                {sibling}
            </WelcomeDialogProvider>
        </FlagProvider>,
        { route },
    );

describe('App after the session ends', () => {
    it('does not show errors cached while logged out once the user signs back in', async () => {
        setupSharedRoutes();
        setupLoggedIn();
        // stands in for the background refreshes that notice the session ended
        let revalidate: ScopedMutator | undefined;
        const CaptureMutate = () => {
            revalidate = useSWRConfig().mutate;
            return null;
        };
        const refresh = (key: string) =>
            act(async () => {
                await revalidate?.(key);
            });
        renderApp('/projects', <CaptureMutate />);
        expect(
            await screen.findByRole('heading', { name: 'Projects (0)' }),
        ).toBeInTheDocument();

        setupLoggedOut();
        testServerRoute(server, '/api/admin/projects', {}, 'get', 401);
        await refresh('api/admin/projects');
        await refresh(USER_ENDPOINT_PATH);
        expect(
            await screen.findByText('Sign in to your instance'),
        ).toBeInTheDocument();

        setupLoggedIn();
        testServerRoute(server, '/api/admin/projects', { projects: [] });
        await refresh(USER_ENDPOINT_PATH);

        expect(
            await screen.findByRole('heading', { name: /^Projects/ }),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Error fetching projects'),
        ).not.toBeInTheDocument();
        await settleProviders();
    });
});

describe('App when logged out', () => {
    it('sends a protected route to login, requesting only what the login page needs', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            versionInfo: { current: { enterprise: '7.0.0' } },
        });
        setupLoggedOut();
        const requested: string[] = [];
        const track = ({ request }: { request: Request }) => {
            requested.push(new URL(request.url).pathname);
        };
        server.events.on('request:start', track);
        onTestFinished(() => {
            server.events.removeListener('request:start', track);
        });

        renderApp('/projects');

        expect(
            await screen.findByText('Sign in to your instance'),
        ).toBeInTheDocument();
        await settleProviders();
        expect(new Set(requested)).toEqual(
            new Set(['/api/admin/user', '/api/admin/ui-config']),
        );
    });
});

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

describe('App while user settings load', () => {
    const setupSettingsFlagOn = () => {
        testServerRoute(server, '/api/admin/ui-config', {
            flags: { userSettings: true },
            unleashContext: { userId: '1' },
        });
        testServerRoute(server, '/api/admin/projects', { projects: [] });
    };

    const renderAppWithUserSettings = (route: string) =>
        render(
            <FlagProvider
                unleashClient={testUnleashClient([])}
                startClient={false}
            >
                <WelcomeDialogProvider>
                    <UserSettingsProvider keys={serverBackedKeys}>
                        <App />
                    </UserSettingsProvider>
                </WelcomeDialogProvider>
            </FlagProvider>,
            { route },
        );

    it('keeps the loader up until the signed-in user settings load', async () => {
        setupSettingsFlagOn();
        setupLoggedIn();
        let release: () => void = () => {};
        const released = new Promise<void>((resolve) => {
            release = resolve;
        });
        let settingsRequested = false;
        server.use(
            http.get('/api/admin/user/settings', async () => {
                settingsRequested = true;
                await released;
                return HttpResponse.json({ settings: {} });
            }),
        );

        renderAppWithUserSettings('/projects');
        await waitFor(() => expect(settingsRequested).toBe(true));
        await settleProviders();

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: /^Projects/ }),
        ).not.toBeInTheDocument();

        release();

        expect(
            await screen.findByRole('heading', { name: 'Projects (0)' }),
        ).toBeInTheDocument();
    });

    it('opens the app when loading the user settings fails', async () => {
        setupSettingsFlagOn();
        setupLoggedIn();
        testServerRoute(server, '/api/admin/user/settings', null, 'get', 403);

        renderAppWithUserSettings('/projects');

        expect(
            await screen.findByRole('heading', { name: 'Projects (0)' }),
        ).toBeInTheDocument();
    });

    it('shows the login page to a signed-out user without waiting for settings', async () => {
        setupSettingsFlagOn();
        setupLoggedOut();

        renderAppWithUserSettings('/projects');

        expect(
            await screen.findByText('Sign in to your instance'),
        ).toBeInTheDocument();
    });
});
