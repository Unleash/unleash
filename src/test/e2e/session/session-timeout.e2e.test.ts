import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';

import type { ISessionOption } from '../../../lib/types/option.js';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import {
    setupAppWithSessionStore,
    type IUnleashTest,
} from '../helpers/test-helper.js';

/**
 * Tests run against real Postgres.
 *
 * Sessions expiry not work with fake timers. We fight the db driver's own timers, and ageing the
 * row exercises the same path a real session takes.
 */
let db: ITestDb;
let app: IUnleashTest;

const IDLE_15: Partial<ISessionOption> = {
    ttlHours: 48,
    idleTimeoutMinutes: 15,
};

beforeAll(async () => {
    db = await dbInit('session_timeout_serial');
});

afterEach(async () => {
    await app?.destroy();
});

afterAll(async () => {
    await db?.destroy();
});

const appWith = async (
    session: Partial<ISessionOption>,
    sessionTimeouts = true,
) => {
    app = await setupAppWithSessionStore(db.stores, db.rawDatabase, {
        session,
        experimental: { flags: { sessionTimeouts } },
    });
    return app;
};

const login = (email: string) =>
    app.request.post('/auth/demo/login').send({ email }).expect(200);

const sessionRowFor = (email: string) =>
    db
        .rawDatabase('unleash_session')
        .select('sid', 'sess', 'expired')
        .whereRaw("sess->'user'->>'email' = ?", [email])
        .first();

/** moves a session's own timestamps back, as if time had passed. */
const ageSession = async (
    email: string,
    {
        idleMs = 0,
        sinceLoginMs = 0,
    }: { idleMs?: number; sinceLoginMs?: number },
) => {
    const row = await sessionRowFor(email);
    expect(row).toBeDefined();

    const { sid, sess } = row!;
    const shift = (value: string, by: number) =>
        new Date(Date.parse(value) - by).toISOString();

    if (sinceLoginMs > 0) {
        sess.authenticatedAt = shift(sess.authenticatedAt, sinceLoginMs);
    }
    if (idleMs > 0) {
        sess.lastInteractionAt = shift(sess.lastInteractionAt, idleMs);
    }

    await db
        .rawDatabase('unleash_session')
        .where({ sid })
        .update({ sess: JSON.stringify(sess) });

    return sid;
};

describe('idle timeout, against the real session store', () => {
    test('a session nobody touched for longer than the window ends', async () => {
        const email = 'idle@getunleash.io';
        await appWith(IDLE_15);
        await login(email);

        await ageSession(email, { idleMs: minutesToMilliseconds(16) });

        await app.request.get('/api/admin/projects').expect(401);
    });

    test('a tab that only polls does not keep itself alive', async () => {
        const email = 'polling@getunleash.io';
        await appWith(IDLE_15);
        await login(email);

        await ageSession(email, { idleMs: minutesToMilliseconds(14) });
        await app.request.get('/api/admin/projects').expect(200);

        await ageSession(email, { idleMs: minutesToMilliseconds(1) });
        await app.request.get('/api/admin/projects').expect(401);
    });

    test('the keep-alive moves the idle deadline, and nothing else does', async () => {
        const email = 'remaining@getunleash.io';
        await appWith(IDLE_15);
        await login(email);

        await ageSession(email, { idleMs: minutesToMilliseconds(14) });
        const stale = (await sessionRowFor(email))?.sess.lastInteractionAt;

        await app.request.post('/api/admin/session/keep-alive').expect(200);
        const renewed = (await sessionRowFor(email))?.sess.lastInteractionAt;
        expect(Date.parse(renewed)).toBeGreaterThan(Date.parse(stale));

        // and the renewal is real: another 14 minutes of silence is survivable
        await ageSession(email, { idleMs: minutesToMilliseconds(14) });
        await app.request.get('/api/admin/projects').expect(200);
    });

    test('the keep-alive cannot revive a session already past its window', async () => {
        const email = 'revive@getunleash.io';
        await appWith(IDLE_15);
        await login(email);

        await ageSession(email, { idleMs: minutesToMilliseconds(16) });

        await app.request.post('/api/admin/session/keep-alive').expect(401);
        await app.request.get('/api/admin/projects').expect(401);
    });
});

describe('the hard max-age', () => {
    test('ends a session however active the user is', async () => {
        // only the login time is aged here, so the session has been active the
        // whole time and still has to go
        const email = 'maxage@getunleash.io';
        await appWith({ ttlHours: 1, idleTimeoutMinutes: 15 });
        await login(email);

        await ageSession(email, {
            sinceLoginMs: hoursToMilliseconds(1) + 1000,
        });

        await app.request.post('/api/admin/session/keep-alive').expect(401);
    });

    test('applies on its own when the idle timeout is off', async () => {
        const email = 'maxage-only@getunleash.io';
        await appWith({ ttlHours: 1, idleTimeoutMinutes: 0 });
        await login(email);

        await ageSession(email, { idleMs: minutesToMilliseconds(30) });
        await app.request.get('/api/admin/projects').expect(200);

        await ageSession(email, {
            sinceLoginMs: hoursToMilliseconds(1) + 1000,
        });
        await app.request.get('/api/admin/projects').expect(401);
    });
});

describe('the stored expiry, which is what the max age used to lose to', () => {
    const storedDeadlineFor = async (email: string) => {
        const row = await sessionRowFor(email);
        expect(row).toBeDefined();

        return {
            expiresAt: new Date(row!.expired).getTime(),
            authenticatedAt: Date.parse(row!.sess.authenticatedAt),
        };
    };

    test.each([
        true,
        false,
    ])('counts from sign-in instead of from the last request (flag on: %s)', async (sessionTimeouts) => {
        const email = `stored-expiry-${sessionTimeouts}@getunleash.io`;
        await appWith(IDLE_15, sessionTimeouts);
        await login(email);

        await ageSession(email, { sinceLoginMs: hoursToMilliseconds(40) });

        await app.request.get('/api/admin/projects').expect(200);
        const first = await storedDeadlineFor(email);
        await app.request.get('/api/admin/projects').expect(200);
        const second = await storedDeadlineFor(email);

        const ceiling = second.authenticatedAt + hoursToMilliseconds(48);
        expect(second.expiresAt).toBeGreaterThanOrEqual(ceiling);
        expect(second.expiresAt - ceiling).toBeLessThan(1000);
        expect(second.expiresAt - first.expiresAt).toBeLessThan(1000);

        expect(second.expiresAt - Date.now()).toBeGreaterThan(
            hoursToMilliseconds(7),
        );
    });
});

describe('sessions that predate this feature', () => {
    test.each([
        ['one they were never given', 'legacy-missing', undefined],
        ['one left empty', 'legacy-empty', ''],
    ])('get a start stamped on their first request, from %s', async (_case, slug, storedStart) => {
        // signing them out instead is a login loop lasting the whole deploy
        const email = `${slug}@getunleash.io`;
        await appWith(IDLE_15);
        await login(email);

        const row = await sessionRowFor(email);
        // `undefined` drops the key, which is the shape an old pod left
        const { lastInteractionAt, ...sess } = row!.sess;
        await db
            .rawDatabase('unleash_session')
            .where({ sid: row!.sid })
            .update({
                sess: JSON.stringify({
                    ...sess,
                    authenticatedAt: storedStart,
                }),
            });

        await app.request.get('/api/admin/projects').expect(200);

        const stamped = await sessionRowFor(email);
        expect(Date.parse(stamped!.sess.authenticatedAt)).not.toBeNaN();
    });
});
