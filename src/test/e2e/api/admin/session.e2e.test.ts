import { minutesToMilliseconds } from 'date-fns';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';

let db: ITestDb;
let app: IUnleashTest;

const IDLE_MINUTES = 15;

const appWith = (sessionTimeouts: boolean) =>
    setupAppWithAuth(
        db.stores,
        {
            session: { idleTimeoutMinutes: IDLE_MINUTES },
            experimental: {
                flags: { strictSchemaValidation: true, sessionTimeouts },
            },
        },
        db.rawDatabase,
    );

const signIn = (email: string) =>
    app.request.post('/auth/demo/login').send({ email }).expect(200);

beforeAll(async () => {
    db = await dbInit('session_keep_alive_serial', getLogger);
});

afterEach(async () => {
    await app?.destroy();
});

afterAll(async () => {
    await db.destroy();
});

test('answers with what is left of the idle window', async () => {
    app = await appWith(true);
    await signIn('keep-alive@getunleash.io');

    const { body } = await app.request
        .post('/api/admin/session/keep-alive')
        .expect(200);

    // a POST renews, so the whole window should be left
    expect(body.expiresInMs).toBe(minutesToMilliseconds(IDLE_MINUTES));
});

test('answers 200 with nothing to report while the flag is off', async () => {
    app = await appWith(false);
    await signIn('keep-alive-off@getunleash.io');

    const { body } = await app.request
        .post('/api/admin/session/keep-alive')
        .expect(200);

    expect(body.expiresInMs).toBeUndefined();
});

test('needs a session of its own to renew', async () => {
    app = await appWith(true);

    await app.request.post('/api/admin/session/keep-alive').expect(401);
});
