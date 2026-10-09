import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import UnauthorizedError from '../error/unauthorized-error.js';
import { resolveSessionLimits } from '../sessions/session-limits.js';
import { sessionCookieOptions } from '../sessions/session-cookie.js';
import {
    evaluateSession,
    type SessionTimeoutReason,
} from '../sessions/session-deadlines.js';

type TimeoutConfig = Pick<
    IUnleashConfig,
    'session' | 'server' | 'secureHeaders' | 'getLogger' | 'flagResolver'
>;

const NON_RENEWING_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const renewsIdleWindow = (req: Request): boolean =>
    !NON_RENEWING_METHODS.has(req.method);

export const sessionTimeoutMiddleware = (
    config: TimeoutConfig,
): RequestHandler => {
    const logger = config.getLogger(
        'lib/middleware/session-timeout-middleware.ts',
    );
    const limits = resolveSessionLimits(config.session);

    const endSession = (
        session: Request['session'],
        res: Response,
        reason: SessionTimeoutReason,
        next: NextFunction,
    ): void => {
        const userId = session.user?.id;

        session.destroy((err) => {
            if (err) {
                // cookie still resolves to it, so nobody has been signed out -> fail the req
                logger.error(
                    `Could not end the session past its ${reason} limit`,
                    err,
                );
                next(err);
                return;
            }

            res.clearCookie(
                config.session.cookieName,
                sessionCookieOptions(config),
            );

            if (reason === 'idle' && config.session.clearSiteDataOnLogout) {
                // idle-timeout: unattended screen, clear its data, not only session
                res.set('Clear-Site-Data', '"cookies", "storage"');
            }

            logger.info(
                `Ended the session of user ${userId} past its ${reason} limit.`,
            );

            const error = new UnauthorizedError(
                'Your session has ended. Please log in again.',
            );
            res.status(error.statusCode).json(error);
        });
    };

    return (req, res, next) => {
        const { session } = req;

        // check before the flag: SDK endpoints never carry a session - cheap check
        if (!session?.user) {
            next();
            return;
        }

        if (!config.flagResolver.isEnabled('sessionTimeouts')) {
            next();
            return;
        }

        const stamp = Date.now();

        // pods from before startSession() mint sessions with no start. drop this
        // once none of them can still be running
        if (session.authenticatedAt === undefined) {
            session.authenticatedAt = new Date(stamp).toISOString();
        }

        const verdict = evaluateSession(
            session,
            limits,
            renewsIdleWindow(req),
            stamp,
        );

        if (verdict.action === 'end') {
            endSession(session, res, verdict.reason, next);
            return;
        }

        if (verdict.shouldRenew) {
            session.lastInteractionAt = new Date(stamp).toISOString();
        }

        res.locals.sessionExpiresInMs = verdict.expiresInMs;

        next();
    };
};
