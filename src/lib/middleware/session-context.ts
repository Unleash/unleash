import type { RequestHandler } from 'express';
import type { IFlagResolver } from '../types/experimental.js';
import { extractClientIp } from '../util/extract-user.js';

/**
 * Records lightweight request context on the user's session the first time an
 * authenticated request is seen: the client IP and the raw `User-Agent` string.
 * These are stored on the session payload (`sess.ip` / `sess.userAgent`) so that
 * enterprise features (e.g. the active sessions admin view) can display and
 * filter sessions by IP and derive browser/device details without adding
 * dedicated columns to the session table.
 *
 * Capture is gated on the `sessionInspector` flag. The flag is resolved per
 * request (not at mount time) so it can be toggled dynamically without
 * restarting the application.
 *
 * We only stamp values once (when they are missing) to avoid marking the
 * session dirty on every request, which keeps the session store write-once per
 * login.
 */
export const sessionContextMiddleware = (
    flagResolver: IFlagResolver,
): RequestHandler => {
    return (req, _res, next) => {
        if (!flagResolver.isEnabled('sessionInspector')) {
            return next();
        }
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
