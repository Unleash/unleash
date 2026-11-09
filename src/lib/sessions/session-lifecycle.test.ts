import type { Request, Response } from 'express';
import {
    endSession,
    startSession,
    type EndSessionConfig,
    type SessionExtras,
    type SessionUser,
} from './session-lifecycle.js';

const user = { id: 666, email: 'devil-as-test@getunleash.io' } as SessionUser;

const requestWithSession = (failSave = false) => {
    const saved: Record<string, unknown>[] = [];
    const req = {} as Request;

    const freshSession = () => {
        const session: Record<string, unknown> = {
            // throws the payload away and puts a fresh object in its place
            regenerate: (callback: (err?: unknown) => void) => {
                (req as { session?: unknown }).session = freshSession();
                callback();
            },
            save: (callback: (err?: unknown) => void) => {
                if (failSave) {
                    callback(new Error('store is down'));
                    return;
                }
                // a snapshot, so a later mutation cannot rewrite history
                saved.push({ ...session });
                callback();
            },
        };
        return session;
    };
    (req as { session?: unknown }).session = freshSession();

    return { req, saved };
};

test('replaces the session before the user is written to it', async () => {
    const { req } = requestWithSession();
    const sessionBeforeLogin = req.session;

    await startSession(req, user);

    expect(req.session).not.toBe(sessionBeforeLogin);
    expect((req.session as { user?: SessionUser }).user).toEqual(user);
});

test('saves the user and both timestamps, in one write', async () => {
    const { req, saved } = requestWithSession();

    await startSession(req, user);

    expect(saved).toHaveLength(1);
    const [payload] = saved as [
        {
            user?: SessionUser;
            authenticatedAt?: string;
            lastInteractionAt?: string;
        },
    ];
    expect(payload.user).toEqual(user);
    expect(Date.parse(payload.authenticatedAt!)).toBeGreaterThan(0);
    expect(payload.lastInteractionAt).toEqual(payload.authenticatedAt);
});

test('keeps `isAPI` when the caller passes it', async () => {
    const { req, saved } = requestWithSession();

    await startSession(req, { ...user, isAPI: true });

    expect((saved[0] as { user?: { isAPI?: boolean } }).user?.isAPI).toBe(true);
});

test('writes a provider`s own state in the same save', async () => {
    const { req, saved } = requestWithSession();

    await startSession(req, user, { logoutUrl: '/auth/saml/logout' });

    expect(saved).toHaveLength(1);
    expect(saved[0].logoutUrl).toBe('/auth/saml/logout');
    expect((saved[0] as { user?: SessionUser }).user).toEqual(user);
});

test('a provider cannot choose the user through its extras', async () => {
    const { req, saved } = requestWithSession();

    // the cast is the point: the type rejects this, and the runtime ordering
    // has to hold anyway for callers that reach the session through `any`.
    await startSession(req, user, {
        user: { id: 1, email: 'somebody-else@getunleash.io' },
    } as unknown as SessionExtras);

    expect((saved[0] as { user?: SessionUser }).user).toEqual(user);
});

test('a provider cannot replace save() through its extras', async () => {
    const { req, saved } = requestWithSession();
    let hijacked = false;

    await startSession(req, user, {
        save: (callback: (err?: unknown) => void) => {
            hijacked = true;
            callback();
        },
    } as unknown as SessionExtras);

    expect(hijacked).toBe(false);
    expect(saved).toHaveLength(1);
});

test('leaves nobody signed in when the save fails', async () => {
    // express-session writes the session again when the response ends, so these
    // fields have to be cleared or a failed login persists a signed-in session.
    const { req } = requestWithSession(true);

    await expect(startSession(req, user)).rejects.toThrow('store is down');

    const session = req.session as {
        user?: SessionUser;
        authenticatedAt?: string;
    };
    expect(session.user).toBeUndefined();
    expect(session.authenticatedAt).toBeUndefined();
});

test('refuses to start a session when no session middleware is mounted', async () => {
    await expect(startSession({} as Request, user)).rejects.toThrow(
        'without a usable session',
    );
});

test('refuses a session that cannot be saved', async () => {
    // save() is called moments after regenerate(), so a session missing it has
    // to be refused by the guard rather than crashing inside promisify().
    const req = {
        session: { regenerate: (callback: () => void) => callback() },
    } as unknown as Request;

    await expect(startSession(req, user)).rejects.toThrow(
        'without a usable session',
    );
});

const endConfig = ({
    baseUriPath = '',
    clearSiteDataOnLogout = true,
    secureHeaders = false,
} = {}) =>
    ({
        session: { cookieName: 'unleash-session', clearSiteDataOnLogout },
        server: { baseUriPath },
        secureHeaders,
        getLogger: () => ({ warn: () => {} }),
    }) as unknown as EndSessionConfig;

// records what the response was told to do, and in which order
const recordingResponse = (order: string[] = []) => {
    const cleared: { name: string; options: unknown }[] = [];
    const headers: Record<string, string> = {};

    const res = {
        clearCookie: (name: string, options: unknown) => {
            order.push('clearCookie');
            cleared.push({ name, options });
        },
        set: (key: string, value: string) => {
            headers[key] = value;
        },
    } as unknown as Response;

    return { res, order, cleared, headers };
};

const requestToEnd = (destroyError?: Error, order: string[] = []) => {
    const req = {
        session: {
            destroy: (callback: (err?: unknown) => void) => {
                order.push('destroy');
                callback(destroyError);
            },
        },
    } as unknown as Request;

    return { req, order };
};

test('clears the cookie with the path it was set with', async () => {
    // a clear without the path is a no-op wherever BASE_URI_PATH is set, which
    // is how three SSO logout paths were leaving the cookie behind
    const { req } = requestToEnd();
    const { res, cleared } = recordingResponse();

    await endSession(req, res, endConfig({ baseUriPath: '/unleash' }));

    expect(cleared).toEqual([
        {
            name: 'unleash-session',
            options: {
                path: '/unleash',
                secure: false,
                sameSite: 'lax',
                httpOnly: true,
            },
        },
    ]);
});

test('tells the browser to drop its data when the instance asks for it', async () => {
    const { req } = requestToEnd();
    const { res, headers } = recordingResponse();

    await endSession(req, res, endConfig({ clearSiteDataOnLogout: true }));

    expect(headers['Clear-Site-Data']).toBe('"cookies", "storage"');
});

test('leaves the browser data alone when it does not', async () => {
    const { req } = requestToEnd();
    const { res, headers } = recordingResponse();

    await endSession(req, res, endConfig({ clearSiteDataOnLogout: false }));

    expect(headers['Clear-Site-Data']).toBeUndefined();
});

test('still signs the browser out when the session cannot be deleted', async () => {
    // the stored session outlives us and expires on its own, but the browser
    // must not be left holding a cookie that still works
    const { req } = requestToEnd(new Error('store is down'));
    const { res, cleared, headers } = recordingResponse();

    await endSession(req, res, endConfig());

    expect(cleared).toHaveLength(1);
    expect(headers['Clear-Site-Data']).toBe('"cookies", "storage"');
});

test('still clears the cookie for a request carrying no session', async () => {
    // an expired or forged cookie resolves to nothing; the browser should
    // still be told to drop it
    const req = {} as Request;
    const { res, cleared } = recordingResponse();

    await endSession(req, res, endConfig());

    expect(cleared).toHaveLength(1);
});
