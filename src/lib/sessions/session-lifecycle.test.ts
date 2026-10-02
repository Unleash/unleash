import type { Request } from 'express';
import {
    startSession,
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
