import { delay, HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, test } from 'vitest';
import { act, screen } from '@testing-library/react';
import { type ScopedMutator, useSWRConfig } from 'swr';
import { USER_ENDPOINT_PATH } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { render, settleProviders } from 'utils/testRenderer';
import { getLocalStorageItem } from 'utils/storage';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { createServerBackedKeys } from './serverBackedKeys.ts';
import {
    UserSettingsProvider,
    useUserSettingsStatus,
} from './UserSettingsProvider.tsx';
import type { UserSettings } from './userSettingsClient.ts';

const server = testServerSetup();

const serverBackedKeys = createServerBackedKeys(['server-backed:v1']);
const [serverBacked] = serverBackedKeys;

const USER_ID = 1;
const UI_CONFIG_PATH = '/api/admin/ui-config';
const SETTINGS_PATH = '/api/admin/user/settings';

const signIn = () => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: USER_ID, name: 'Test User', email: 'test@test.com' },
        permissions: [],
        feedback: [],
        splash: {},
    });
};

const signOut = () => {
    testServerRoute(server, '/api/admin/user', {
        type: 'password',
        path: '/auth/simple/login',
        message: '',
        defaultHidden: false,
        options: [],
    });
};

const uiConfigFor = (
    userId: number | undefined,
    flags: { userSettings?: boolean } = {},
) => ({
    flags,
    unleashContext: userId === undefined ? {} : { userId: String(userId) },
});

const answerUiConfigInTurn = (
    ...answers: Array<() => Response | Promise<Response>>
) => {
    let calls = 0;
    server.use(
        http.get(UI_CONFIG_PATH, () => {
            const answer = answers[Math.min(calls, answers.length - 1)];
            calls++;
            return answer();
        }),
    );
    return { calls: () => calls };
};

const answerSettings = (respond: () => Promise<Response>) => {
    let calls = 0;
    server.use(
        http.get(SETTINGS_PATH, () => {
            calls++;
            return respond();
        }),
    );
    return { calls: () => calls };
};

const heldSettingsLoads = (settings: UserSettings = {}) => {
    const releases: Array<() => void> = [];
    const route = answerSettings(
        () =>
            new Promise<Response>((resolve) => {
                releases.push(() => resolve(HttpResponse.json({ settings })));
            }),
    );
    const release = (call: number) => releases[call]();
    return { ...route, release };
};

const StatusProbe = () => {
    const status = useUserSettingsStatus();
    return <p>status: {status}</p>;
};

const StoredValueProbe = () => {
    const status = useUserSettingsStatus();
    const storedValue = getLocalStorageItem(serverBacked.localStorageName);
    return (
        <p>
            {status}: {String(storedValue)}
        </p>
    );
};

const renderProvider = () => {
    let mutate: ScopedMutator | undefined;
    const CaptureMutate = () => {
        mutate = useSWRConfig().mutate;
        return null;
    };
    render(
        <UserSettingsProvider keys={serverBackedKeys}>
            <CaptureMutate />
            <StatusProbe />
        </UserSettingsProvider>,
    );
    const refetchUser = () =>
        act(async () => {
            await mutate?.(USER_ENDPOINT_PATH);
        });
    return { refetchUser };
};

const expectStatus = async (status: string) =>
    expect(await screen.findByText(`status: ${status}`)).toBeInTheDocument();

describe('UserSettingsProvider', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    test('is off outside the provider', async () => {
        render(<StatusProbe />);

        await expectStatus('off');
    });

    test('stays pending without loading settings while signed out', async () => {
        signOut();
        testServerRoute(server, UI_CONFIG_PATH, uiConfigFor(undefined));
        const settings = answerSettings(async () =>
            HttpResponse.json({ settings: {} }),
        );

        renderProvider();
        await settleProviders();
        await settleProviders();

        await expectStatus('pending');
        expect(settings.calls()).toBe(0);
    });

    test('is off without loading settings when the userSettings flag is off', async () => {
        signIn();
        testServerRoute(server, UI_CONFIG_PATH, uiConfigFor(USER_ID));
        const settings = answerSettings(async () =>
            HttpResponse.json({ settings: {} }),
        );

        renderProvider();

        await expectStatus('off');
        expect(settings.calls()).toBe(0);
    });

    test('stays pending until the settings arrive', async () => {
        signIn();
        testServerRoute(
            server,
            UI_CONFIG_PATH,
            uiConfigFor(USER_ID, { userSettings: true }),
        );
        const settings = heldSettingsLoads();

        renderProvider();
        await expectStatus('pending');
        await settleProviders();
        expect(settings.calls()).toBe(1);

        settings.release(0);

        await expectStatus('loaded');
    });

    test('stays pending on the next sign-in when the previous settings load answers after sign-out', async () => {
        signIn();
        testServerRoute(
            server,
            UI_CONFIG_PATH,
            uiConfigFor(USER_ID, { userSettings: true }),
        );
        const settings = heldSettingsLoads();

        const { refetchUser } = renderProvider();
        await settleProviders();
        expect(settings.calls()).toBe(1);

        signOut();
        await refetchUser();
        await act(async () => settings.release(0));
        await settleProviders();

        signIn();
        await refetchUser();
        await settleProviders();
        expect(settings.calls()).toBe(2);
        await expectStatus('pending');

        await act(async () => settings.release(1));
        await expectStatus('loaded');
    });

    test('children see the server values once settings are loaded', async () => {
        signIn();
        testServerRoute(
            server,
            UI_CONFIG_PATH,
            uiConfigFor(USER_ID, { userSettings: true }),
        );
        testServerRoute(server, SETTINGS_PATH, {
            settings: { 'server-backed:v1': { value: 'from server' } },
        });

        render(
            <UserSettingsProvider keys={serverBackedKeys}>
                <StoredValueProbe />
            </UserSettingsProvider>,
        );

        expect(
            await screen.findByText('loaded: from server'),
        ).toBeInTheDocument();
    });

    test('does not write the server values when the load ends after the provider is gone', async () => {
        signIn();
        testServerRoute(
            server,
            UI_CONFIG_PATH,
            uiConfigFor(USER_ID, { userSettings: true }),
        );
        const settings = heldSettingsLoads({
            'server-backed:v1': { value: 'from server' },
        });

        const { unmount } = render(
            <UserSettingsProvider keys={serverBackedKeys}>
                <StatusProbe />
            </UserSettingsProvider>,
        );
        await settleProviders();
        expect(settings.calls()).toBe(1);
        unmount();
        settings.release(0);
        await settleProviders();

        expect(
            getLocalStorageItem(serverBacked.localStorageName),
        ).toBeUndefined();
    });

    test('uses flags already evaluated for the user without refetching ui-config', async () => {
        signIn();
        const uiConfig = answerUiConfigInTurn(() =>
            HttpResponse.json(uiConfigFor(USER_ID, { userSettings: true })),
        );
        testServerRoute(server, SETTINGS_PATH, { settings: {} });

        renderProvider();

        await expectStatus('loaded');
        expect(uiConfig.calls()).toBe(1);
    });

    test('refetches ui-config when its flags were not evaluated for the user and uses the refetched flags', async () => {
        signIn();
        const uiConfig = answerUiConfigInTurn(
            () => HttpResponse.json(uiConfigFor(undefined)),
            () =>
                HttpResponse.json(uiConfigFor(USER_ID, { userSettings: true })),
        );
        testServerRoute(server, SETTINGS_PATH, { settings: {} });

        renderProvider();

        await expectStatus('loaded');
        expect(uiConfig.calls()).toBe(2);
    });

    test('refetches ui-config only once, then uses the refetched flags', async () => {
        signIn();
        const uiConfig = answerUiConfigInTurn(
            () => HttpResponse.json(uiConfigFor(undefined)),
            () =>
                HttpResponse.json(
                    uiConfigFor(undefined, { userSettings: true }),
                ),
        );
        testServerRoute(server, SETTINGS_PATH, { settings: {} });

        renderProvider();

        await expectStatus('loaded');
        await settleProviders();
        expect(uiConfig.calls()).toBe(2);
    });

    test('stops waiting when the ui-config refetch fails', async () => {
        signIn();
        const uiConfig = answerUiConfigInTurn(
            () => HttpResponse.json(uiConfigFor(undefined)),
            () => HttpResponse.json({}, { status: 500 }),
        );
        const settings = answerSettings(async () =>
            HttpResponse.json({ settings: {} }),
        );

        renderProvider();

        await expectStatus('off');
        expect(uiConfig.calls()).toBe(2);
        expect(settings.calls()).toBe(0);
    });

    test('stays pending while the ui-config refetch is in flight', async () => {
        signIn();
        const uiConfig = answerUiConfigInTurn(
            () => HttpResponse.json(uiConfigFor(undefined)),
            async () => {
                await delay('infinite');
                return HttpResponse.json(uiConfigFor(USER_ID));
            },
        );

        renderProvider();
        await settleProviders();
        await settleProviders();

        await expectStatus('pending');
        expect(uiConfig.calls()).toBe(2);
    });

    test('refetches ui-config again when the user signs in after signing out', async () => {
        signIn();
        const uiConfig = answerUiConfigInTurn(() =>
            HttpResponse.json(uiConfigFor(undefined)),
        );

        const { refetchUser } = renderProvider();
        await expectStatus('off');
        expect(uiConfig.calls()).toBe(2);

        signOut();
        await refetchUser();
        await expectStatus('pending');

        signIn();
        await refetchUser();
        await expectStatus('off');
        expect(uiConfig.calls()).toBe(3);
    });

    test('refetches ui-config on the next sign-in when the previous refetch answers after sign-out', async () => {
        signIn();
        let releaseRefetch: () => void = () => {};
        const refetchReleased = new Promise<void>((resolve) => {
            releaseRefetch = resolve;
        });
        const uiConfig = answerUiConfigInTurn(
            () => HttpResponse.json(uiConfigFor(undefined)),
            async () => {
                await refetchReleased;
                return HttpResponse.json(uiConfigFor(undefined));
            },
            () => HttpResponse.json(uiConfigFor(undefined)),
        );

        const { refetchUser } = renderProvider();
        await settleProviders();
        expect(uiConfig.calls()).toBe(2);

        signOut();
        await refetchUser();
        await act(async () => releaseRefetch());
        await settleProviders();

        signIn();
        await refetchUser();
        await expectStatus('off');
        expect(uiConfig.calls()).toBe(3);
    });
});
