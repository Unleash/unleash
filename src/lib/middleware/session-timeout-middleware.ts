import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import type { Logger } from '../logger.js';
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

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const isUserActivity = (req: Request): boolean => !READ_METHODS.has(req.method);

const endSession = (
    session: Request['session'],
    res: Response,
    config: TimeoutConfig,
    reason: SessionTimeoutReason,
    logger: Logger,
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

        if (reason === 'idled' && config.session.clearSiteDataOnLogout) {
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

export const sessionTimeoutMiddleware = (
    config: TimeoutConfig,
): RequestHandler => {
    const logger = config.getLogger(
        'lib/middleware/session-timeout-middleware.ts',
    );
    const limits = resolveSessionLimits(config.session);

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
        const verdict = evaluateSession(
            session,
            limits,
            isUserActivity(req),
            stamp,
        );

        if (verdict.action === 'end') {
            endSession(session, res, config, verdict.reason, logger, next);
            return;
        }

        if (verdict.shouldRenew) {
            session.lastInteractionAt = new Date(stamp).toISOString();
        }

        next();
    };
};
