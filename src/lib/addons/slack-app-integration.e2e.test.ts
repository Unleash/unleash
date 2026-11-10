import {
    createUserWithRootRole,
    type IUnleashTest,
    setupAppWithAuth,
} from '../../test/e2e/helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../test/e2e/helpers/database-init.js';
import getLogger from '../../test/fixtures/no-logger.js';
import {
    CREATE_ADDON,
    RoleName,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
} from '../types/index.js';
import { CUSTOM_ROOT_ROLE_TYPE } from '../util/index.js';
import { randomId } from '../util/random-id.js';
import { sealForInstance } from './slack-app-fake-broker.js';

let app: IUnleashTest;
let db: ITestDb;

const INSTALL = '/api/admin/integrations/slack-app/install';
const CALLBACK = '/api/admin/integrations/slack-app/callback';
const TOKEN = 'xoxb-e2e-token-0123456789';

beforeAll(async () => {
    db = await dbInit('slack_app_install', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            enterpriseVersion: 'enterprise',
            experimental: { flags: { slackAppAuthV2: true } },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const loginWithRootRole = async (roleName: RoleName) => {
    const email = `${randomId()}@example.com`;
    await createUserWithRootRole({ app, stores: db.stores, email, roleName });
    await app.login({ email });
};

const startInstall = async (query = 'parameters[defaultChannels]=general') => {
    const { headers } = await app.request
        .get(`${INSTALL}?${query}`)
        .set('Sec-Fetch-Site', 'same-origin')
        .expect(302);
    return new URL(headers.location);
};

const brokerCallback = (connectUrl: URL) => ({
    state: connectUrl.searchParams.get('state')!,
    sealed_connection: sealForInstance(
        connectUrl.searchParams.get('public_key')!,
        {
            accessToken: TOKEN,
            team: { id: 'T1', name: 'Acme' },
        },
    ),
});

const landingOf = (path: string) => new URL(path, 'http://localhost:4242');

test('saves the integration with the token Slack sent', async () => {
    await loginWithRootRole(RoleName.ADMIN);
    const connectUrl = await startInstall();

    const { body } = await app.request
        .post(CALLBACK)
        .send(brokerCallback(connectUrl))
        .expect(200);

    const [, id] = landingOf(body.path).pathname.match(
        /^\/integrations\/edit\/(\d+)$/,
    )!;
    expect(await db.stores.addonStore.get(Number(id))).toMatchObject({
        provider: 'slack-app',
        parameters: { accessToken: TOKEN },
    });
});

test('saves an integration started from a project in that project', async () => {
    await loginWithRootRole(RoleName.ADMIN);
    const connectUrl = await startInstall('project=default');

    const { body } = await app.request
        .post(CALLBACK)
        .send(brokerCallback(connectUrl))
        .expect(200);

    const [, id] = landingOf(body.path).pathname.match(
        /^\/projects\/default\/settings\/integrations\/edit\/(\d+)$/,
    )!;
    expect(await db.stores.addonStore.get(Number(id))).toMatchObject({
        projects: ['default'],
    });
});

test('accepts each connection once', async () => {
    await loginWithRootRole(RoleName.ADMIN);
    const callback = brokerCallback(await startInstall());
    await app.request.post(CALLBACK).send(callback).expect(200);

    const { body } = await app.request
        .post(CALLBACK)
        .send(callback)
        .expect(200);

    expect(landingOf(body.path).searchParams.get('errorMsg')).toContain(
        'Unleash could not find this Slack connection.',
    );
});

test('explains when the integration Slack connected cannot be saved', async () => {
    await loginWithRootRole(RoleName.ADMIN);
    const connectUrl = await startInstall('parameters[nested][too][deep]=x');

    const { body } = await app.request
        .post(CALLBACK)
        .send(brokerCallback(connectUrl))
        .expect(400);

    expect(body).toMatchObject({
        name: 'BadDataError',
        details: [
            {
                message: expect.stringContaining(
                    '"parameters.nested.too" must be a string',
                ),
            },
        ],
    });
});

test('refuses an install that does not start on an Unleash page', async () => {
    await loginWithRootRole(RoleName.ADMIN);

    for (const site of ['cross-site', 'same-site', 'none']) {
        const { headers } = await app.request
            .get(INSTALL)
            .set('Sec-Fetch-Site', site)
            .expect(302);

        expect(landingOf(headers.location).searchParams.get('errorMsg')).toBe(
            'Start Install & connect from the integration form in Unleash.',
        );
    }
});

test('returns to the address the page has Unleash open on', async () => {
    await loginWithRootRole(RoleName.ADMIN);

    const connectUrl = await startInstall(
        'unleashUrl=https://unleash.acme.example',
    );

    expect(connectUrl.searchParams.get('return_to')).toBe(
        'https://unleash.acme.example',
    );
});

test("returns to UNLEASH_URL, not the link's address, for a browser without Sec-Fetch-Site", async () => {
    await loginWithRootRole(RoleName.ADMIN);

    const { headers } = await app.request
        .get(`${INSTALL}?unleashUrl=https://unleash.attacker.example`)
        .expect(302);

    expect(new URL(headers.location).searchParams.get('return_to')).toBe(
        app.config.server.unleashUrl,
    );
});

test('refuses more than one project', async () => {
    await loginWithRootRole(RoleName.ADMIN);

    await app.request.get(`${INSTALL}?project=a&project=b`).expect(400);
});

test('refuses a user who may not create integrations', async () => {
    await loginWithRootRole(RoleName.VIEWER);

    await app.request.get(INSTALL).expect(403);
});

// A root Viewer sees only the private projects they belong to, while a custom
// root role can still let them create integrations.
const loginAsViewerWhoMayCreateIntegrations = async () => {
    const { accessService, userService } = app.services;
    const email = `${randomId()}@example.com`;
    const viewerRole = (await accessService.getPredefinedRole(
        RoleName.VIEWER,
    ))!;
    const user = await userService.createUser(
        { email, rootRole: viewerRole.id },
        SYSTEM_USER_AUDIT,
    );
    const role = await accessService.createRole(
        {
            name: `role_${email}`,
            description: 'Creates integrations',
            permissions: [{ name: CREATE_ADDON }],
            type: CUSTOM_ROOT_ROLE_TYPE,
            createdByUserId: SYSTEM_USER_ID,
        },
        SYSTEM_USER_AUDIT,
    );
    await accessService.addUserToRole(user.id, role.id, 'default');
    await app.login({ email });
};

test('refuses a private project the user cannot see', async () => {
    const project = randomId();
    await db.stores.projectStore.create({
        id: project,
        name: project,
        mode: 'private',
    });
    await loginAsViewerWhoMayCreateIntegrations();

    await app.request
        .get(`${INSTALL}?project=${project}`)
        .set('Sec-Fetch-Site', 'same-origin')
        .expect(404);
});
