import type { RequestHandler } from 'express';
import { extractClientIp } from '../util/extract-user.js';

/**
 * Records lightweight request context on the user's session the first time an
 * authenticated request is seen: the client IP and the raw `User-Agent` string.
 * These are stored on the session payload (`sess.ip` / `sess.userAgent`) so that
 * enterprise features (e.g. the active sessions admin view) can display and
 * filter sessions by IP and derive browser/device details without adding
 * dedicated columns to the session table.
 *
 * We only stamp values once (when they are missing) to avoid marking the
 * session dirty on every request, which keeps the session store write-once per
 * login.
 */
export const sessionContextMiddleware = (): RequestHandler => {
    return (req, _res, next) => {
        const session = req.session as
            | (typeof req.session & {
                  user?: unknown;
                  ip?: string;
                  userAgent?: string;
              })
            | undefined;
        if (session?.user) {
            if (!session.ip) {
                session.ip = extractClientIp(req);
            }
            if (!session.userAgent) {
                const userAgent = req.headers['user-agent'];
                if (userAgent) {
                    session.userAgent = userAgent;
                }
            }
        }
        next();
    };
};
