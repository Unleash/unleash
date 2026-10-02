import { promisify } from 'util';
import type { Request } from 'express';
import type { SessionData } from 'express-session';
import type { IUser } from '../types/user.js';

export type SessionUser = Omit<IUser, 'isAPI'> & { isAPI?: boolean };

/**
 * What Unleash keeps on the session payload. express-session picks this up by
 * declaration merging, so `req.session` is typed wherever it is touched instead
 * of being described a second time here and left to drift. It also means a
 * provider cannot assign over the session's own cookie or its methods, because
 * they are not part of this shape.
 */
declare module 'express-session' {
    interface SessionData {
        user?: SessionUser;
        authenticatedAt?: string;
        lastInteractionAt?: string;
        logoutUrl?: string;
        auth?: Record<string, unknown>;
    }
}

export type SessionExtras = Pick<SessionData, 'logoutUrl' | 'auth'>;

export const startSession = async (
    req: Request<any, any, any, any>,
    user: SessionUser,
    extras: SessionExtras = {},
): Promise<void> => {
    if (!req.session?.regenerate || !req.session?.save) {
        throw new Error(
            'startSession was called on a request without a usable session. The session middleware has to be mounted before login.',
        );
    }

    // regenerate() creates a new ID, so everything set after it is safe. It also
    // replaces req.session, so bind save() to the session it leaves behind.
    await promisify(req.session.regenerate).bind(req.session)();

    const { session } = req;
    const save = promisify(session.save).bind(session);
    const now = new Date().toISOString();

    // extras first, so the fields below always win
    Object.assign(session, extras, {
        user,
        authenticatedAt: now,
        lastInteractionAt: now,
    });

    // save now so we catch errors before responding. can't take back a redirect
    try {
        await save();
    } catch (error) {
        // save() failed, so the session is half-logged-in: in memory but not
        // stored, and express-session will try to save again when the response
        // ends. Clear what we set so that attempt is anonymous rather than a
        // login behind a 500.
        session.user = undefined;
        session.authenticatedAt = undefined;
        session.lastInteractionAt = undefined;
        session.logoutUrl = undefined;
        session.auth = undefined;

        throw error;
    }
};
