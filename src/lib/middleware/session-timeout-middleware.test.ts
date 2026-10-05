import express from 'express';
import session from 'express-session';
import request from 'supertest';
import { promisify } from 'util';
import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';
import { sessionTimeoutMiddleware } from './session-timeout-middleware.js';
import {
    startSession,
    type SessionUser,
} from '../sessions/session-lifecycle.js';

const COOKIE_NAME = 'unleash-session';

const user = { id: 7, email: 'timeout-as-test@getunleash.io' } as SessionUser;

const createApp = ({
    idleTimeoutMinutes = 15,
    ttlHours = 48,
    flagEnabled = true,
    rejectWrites = false,
} = {}) => {
    const store = new session.MemoryStore();
    const logged: string[] = [];
    const app = express();

    const breakStore = () => {
        store.destroy = (_sid, callback) =>
            callback?.(new Error('store is down'));
    };

    app.use(
        session({
            name: COOKIE_NAME,
            rolling: false,
            resave: false,
            saveUninitialized: false,
            store,
            secret: ['session-timeout-test'],
            cookie: {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                maxAge: hoursToMilliseconds(ttlHours),
            },
        }),
    );

    app.post('/login', (req, res, next) => {
        startSession(req, user).then(() => res.sendStatus(200), next);
    });

    // ages the stored session so a test does not have to wait. Outside /api, so
    // the middleware under test does not see it.
    app.post('/rewind', (req, res) => {
        const back = (raw: unknown) =>
            new Date(Date.now() - Number(raw)).toISOString();

        if (req.query.login !== undefined) {
            req.session.authenticatedAt = back(req.query.login);
        }
        if (req.query.idle !== undefined) {
            req.session.lastInteractionAt = back(req.query.idle);
        }
        req.session.save(() => res.sendStatus(200));
    });

    app.use(
        '/api',
        sessionTimeoutMiddleware({
            session: {
                cookieName: COOKIE_NAME,
                clearSiteDataOnLogout: true,
                ttlHours,
                idleTimeoutMinutes,
            },
            server: { baseUriPath: '' },
            secureHeaders: false,
            getLogger: () => ({
                debug: (message: string) => logged.push(message),
                info: (message: string) => logged.push(message),
                warn: (message: string) => logged.push(message),
                error: (message: string) => logged.push(message),
            }),
            flagResolver: { isEnabled: () => flagEnabled },
        } as never),
    );

    if (rejectWrites) {
        // stands in for anything mounted after this middleware that can refuse
        // a write: the enterprise licence gate on /api/admin, or maintenance
        // mode. Both sit later in app.ts than the middleware under test.
        app.use('/api', (req, res, next) => {
            if (req.method === 'GET') {
                next();
                return;
            }
            res.status(403).json({ message: 'refused by a later middleware' });
        });
    }

    app.use('/api', (req, res) => {
        res.status(200).json({
            userId: req.session?.user?.id ?? null,
            lastInteractionAt: req.session?.lastInteractionAt ?? null,
            expiresInMs: res.locals.sessionExpiresInMs ?? null,
        });
    });

    const storedSessions = async () => {
        const all = await promisify(store.all).bind(store)();
        return Object.keys(all ?? {});
    };

    return { agent: request.agent(app), logged, storedSessions, breakStore };
};

const signedIn = async (options = {}) => {
    const app = createApp(options);
    await app.agent.post('/login').expect(200);
    return app;
};

test('leaves an anonymous request alone', async () => {
    const { agent } = createApp();

    const res = await agent.get('/api/admin/projects');

    expect(res.status).toBe(200);
    expect(res.body.userId).toBeNull();
    expect(res.headers['set-cookie']).toBeUndefined();
});

test('does nothing while the flag is off, however idle the session is', async () => {
    const { agent, storedSessions } = await signedIn({ flagEnabled: false });
    await agent.post('/rewind?idle=3600000').expect(200);

    const res = await agent.get('/api/admin/projects');

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(7);
    expect(await storedSessions()).toHaveLength(1);
});

test('ends an idle session: one cookie, cleared, and the row is gone', async () => {
    const { agent, storedSessions } = await signedIn();
    expect(await storedSessions()).toHaveLength(1);

    await agent.post('/rewind?idle=1800000').expect(200);
    const res = await agent.get('/api/admin/projects');

    expect(res.status).toBe(401);
    // regenerate() used to leave express-session believing the session had
    // changed, so it set a second cookie over this one and stored a row for it.
    expect(res.headers['set-cookie']).toHaveLength(1);
    expect(String(res.headers['set-cookie'])).toContain(`${COOKIE_NAME}=;`);
    expect(res.headers['clear-site-data']).toBe('"cookies", "storage"');
    expect(await storedSessions()).toHaveLength(0);
});

test('ending a session at its max age leaves the site data alone', async () => {
    // only the idle case is about an unattended screen. A session reaching its
    // max age may well be in front of someone working.
    const { agent } = await signedIn({ ttlHours: 1 });
    await agent.post('/rewind?login=7200000&idle=0').expect(200);

    const res = await agent.get('/api/admin/projects');

    expect(res.status).toBe(401);
    expect(res.headers['clear-site-data']).toBeUndefined();
});

test('a session the store cannot delete is not reported as signed out', async () => {
    const { agent, logged, storedSessions, breakStore } = await signedIn();
    await agent.post('/rewind?idle=1800000').expect(200);
    breakStore();

    const res = await agent.get('/api/admin/projects');

    // the row is still there and the cookie still resolves to it, so answering
    // 401 and clearing the cookie would claim a teardown that did not happen
    expect(res.status).toBe(500);
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(res.headers['clear-site-data']).toBeUndefined();
    expect(await storedSessions()).toHaveLength(1);
    expect(logged.some((line) => line.includes('Could not end'))).toBe(true);
});

test('a write renews the idle window', async () => {
    const { agent } = await signedIn();
    await agent.post('/rewind?idle=600000').expect(200);

    const before = (await agent.get('/api/admin/projects')).body
        .lastInteractionAt;
    const res = await agent.post('/api/admin/projects');

    expect(res.status).toBe(200);
    const after = (await agent.get('/api/admin/projects')).body
        .lastInteractionAt;
    expect(Date.parse(after)).toBeGreaterThan(Date.parse(before));
});

test('leaves the cookie alone at the configured lifetime', async () => {
    // shortening it to the deadline would mean the browser could drop the cookie
    // first, and then there is no request left to answer 401 and Clear-Site-Data
    const { agent } = await signedIn();
    await agent.post('/rewind?idle=600000').expect(200);

    const res = await agent.post('/api/admin/projects');

    // express-session serialises the lifetime as `Expires`; its cookie data
    // leaves `maxAge` out, so there is no Max-Age to read here.
    const expiresAt = Date.parse(
        /Expires=([^;]+)/.exec(String(res.headers['set-cookie']))?.[1] ?? '',
    );
    expect(expiresAt - Date.now()).toBeGreaterThan(hoursToMilliseconds(47));
});

test('hands the deadline to the request for the keep-alive to report', async () => {
    // the endpoint answers with this, as a duration, so that a browser with a
    // wrong clock still counts down to the right moment
    const { agent } = await signedIn();
    await agent.post('/rewind?idle=600000').expect(200);

    const read = await agent.get('/api/admin/projects');
    const renewed = await agent.post('/api/admin/projects');

    // five minutes of the idle window left on a read; a write restarts it
    expect(read.body.expiresInMs).toBeGreaterThan(minutesToMilliseconds(4));
    expect(read.body.expiresInMs).toBeLessThanOrEqual(minutesToMilliseconds(5));
    expect(renewed.body.expiresInMs).toBe(minutesToMilliseconds(15));
});

test('a request a later middleware rejects still renews the idle window', async () => {
    const { agent } = await signedIn({ rejectWrites: true });
    await agent.post('/rewind?idle=600000').expect(200);

    const before = (await agent.get('/api/admin/projects')).body
        .lastInteractionAt;
    await agent.post('/api/admin/session/keep-alive').expect(403);
    const after = (await agent.get('/api/admin/projects')).body
        .lastInteractionAt;

    expect(Date.parse(after)).toBeGreaterThan(Date.parse(before));
});

test('a read leaves the session signed in without renewing it', async () => {
    const { agent } = await signedIn();
    await agent.post('/rewind?idle=600000').expect(200);

    const before = (await agent.get('/api/admin/projects')).body
        .lastInteractionAt;
    const res = await agent.get('/api/admin/features');
    const after = (await agent.get('/api/admin/projects')).body
        .lastInteractionAt;

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(7);
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(after).toBe(before);
});
