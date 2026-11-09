import { SYSTEM_USER_AUDIT } from '../types/index.js';
import type { IAddonDto } from '../types/stores/addon-store.js';
import NotFoundError from '../error/notfound-error.js';
import { createTestConfig } from '../../test/config/test-config.js';
import {
    type ISlackAppPendingConnection,
    type SlackAppCallbackBody,
    SlackAppInstallService,
} from './slack-app-install-service.js';
import { sealForInstance } from './slack-app-fake-broker.js';

const BROKER_URL = 'https://broker.example.com';
const INTEGRATION_ID = 7;
const slackConnection = {
    accessToken: 'xoxb-the-token-0123456789',
    team: { id: 'T1', name: 'Acme' },
};

const createService = ({ enabled = true } = {}) => {
    const saved: (IAddonDto & { projectId?: string })[] = [];
    let now = Date.parse('2026-10-29T12:00:00Z');
    const service = new SlackAppInstallService(
        {
            addonService: {
                createAddon: async (addon, _auditUser, projectId) => {
                    saved.push({ ...addon, projectId });
                    return {
                        ...addon,
                        id: INTEGRATION_ID,
                        description: addon.description ?? null,
                        createdAt: new Date(now),
                    };
                },
            },
        },
        createTestConfig({
            server: {
                unleashUrl: 'https://unleash.example.com/acme',
                slackAppBrokerUrl: BROKER_URL,
            },
            experimental: { flags: { slackAppAuthV2: enabled } },
        }),
        () => now,
    );
    const advanceClockMinutes = (minutes: number) => {
        now += minutes * 60 * 1000;
    };
    return { service, saved, advanceClockMinutes };
};

const parameters = { defaultChannels: 'general' };

const brokerCallback = (
    connectUrl: string,
    sealedConnection: object = slackConnection,
) => {
    const params = new URL(connectUrl).searchParams;
    return {
        state: params.get('state')!,
        sealed_connection: sealForInstance(
            params.get('public_key')!,
            sealedConnection as typeof slackConnection,
        ),
    };
};

const complete = async (
    service: SlackAppInstallService,
    connection: ISlackAppPendingConnection | undefined,
    callback: SlackAppCallbackBody,
) =>
    service.completeInstall(
        service.verifyConnection(connection, callback.state),
        callback,
        SYSTEM_USER_AUDIT,
    );

test('sends the admin to the broker with the instance address, a public key and the connection id', async () => {
    const { service } = createService();

    const { connectUrl, connection } = await service.startInstall(
        parameters,
        'default',
    );

    const url = new URL(connectUrl);
    expect(`${url.origin}${url.pathname}`).toBe(`${BROKER_URL}/connect`);
    expect(Object.fromEntries(url.searchParams)).toStrictEqual({
        return_to: 'https://unleash.example.com/acme',
        public_key: expect.stringMatching(/^[\w-]{563}$/),
        state: connection.id,
    });
    expect(connection).toMatchObject({ projectId: 'default', parameters });
});

test('uses a new key pair for every connection', async () => {
    const { service } = createService();

    const first = new URL((await service.startInstall(parameters)).connectUrl);
    const second = new URL((await service.startInstall(parameters)).connectUrl);

    expect(first.searchParams.get('public_key')).not.toBe(
        second.searchParams.get('public_key'),
    );
});

test('returns to the address the admin has Unleash open on, over UNLEASH_URL', async () => {
    const { service } = createService();

    const { connectUrl } = await service.startInstall(
        parameters,
        undefined,
        'https://unleash.acme.example/base',
    );

    expect(new URL(connectUrl).searchParams.get('return_to')).toBe(
        'https://unleash.acme.example/base',
    );
});

test('saves the integration with the token the broker sealed, named after the workspace', async () => {
    const { service, saved } = createService();
    const { connectUrl, connection } = await service.startInstall(
        parameters,
        'default',
    );

    const integrationId = await complete(
        service,
        connection,
        brokerCallback(connectUrl),
    );

    expect(integrationId).toBe(INTEGRATION_ID);
    expect(saved).toEqual([
        {
            provider: 'slack-app',
            enabled: true,
            description: 'Slack workspace Acme',
            parameters: {
                defaultChannels: 'general',
                accessToken: slackConnection.accessToken,
            },
            events: [],
            projectId: 'default',
        },
    ]);
});

test('refuses a callback without a pending connection, or for another one', async () => {
    const { service } = createService();
    const { connectUrl, connection } = await service.startInstall(parameters);
    const callback = brokerCallback(connectUrl);

    for (const [started, state] of [
        [undefined, callback.state],
        [connection, 'another-connection'],
        [connection, undefined],
    ] as const) {
        await expect(
            complete(service, started, { ...callback, state }),
        ).rejects.toThrow('Unleash could not find this Slack connection.');
    }
});

test('refuses a token sealed to another connection', async () => {
    const { service } = createService();
    const first = await service.startInstall(parameters);
    const second = await service.startInstall(parameters);

    await expect(
        complete(service, first.connection, {
            state: first.connection.id,
            sealed_connection: brokerCallback(second.connectUrl)
                .sealed_connection,
        }),
    ).rejects.toThrow('Unleash could not read the token Slack sent.');
});

test('refuses a sealed connection without a token or a workspace', async () => {
    const { service } = createService();
    const { connectUrl, connection } = await service.startInstall(parameters);

    for (const sealedConnection of [
        { team: slackConnection.team },
        { accessToken: slackConnection.accessToken },
    ]) {
        await expect(
            complete(
                service,
                connection,
                brokerCallback(connectUrl, sealedConnection),
            ),
        ).rejects.toThrow('Unleash could not read the token Slack sent.');
    }
});

test('refuses a connection after an hour', async () => {
    const { service, advanceClockMinutes } = createService();
    const { connectUrl, connection } = await service.startInstall(parameters);

    advanceClockMinutes(61);

    await expect(
        complete(service, connection, brokerCallback(connectUrl)),
    ).rejects.toThrow('Unleash could not find this Slack connection.');
});

test('passes on why Slack did not connect', async () => {
    const { service } = createService();
    const { connection } = await service.startInstall(parameters);

    for (const [error, reason] of [
        ['access_denied', 'access_denied'],
        [undefined, 'no token returned'],
    ]) {
        await expect(
            complete(service, connection, { state: connection.id, error }),
        ).rejects.toThrow(`Slack did not connect (${reason}).`);
    }
});

test('answers 404 while the flag is off', async () => {
    const { service } = createService({ enabled: false });

    await expect(service.startInstall(parameters)).rejects.toThrow(
        NotFoundError,
    );
    expect(() => service.verifyConnection(undefined, 'any')).toThrow(
        NotFoundError,
    );
});
