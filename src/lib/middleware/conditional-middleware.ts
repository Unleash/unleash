import type { RequestHandler } from 'express';
import type { IFlagKey, IUnleashConfig } from '../server-impl.js';

/**
 * @deprecated Prefer `requireEnabledFlag(config, flagName)` in `app.use(...)`
 * for new code.
 *
 * `conditionalMiddleware` exists for backwards compatibility, but it is easier
 * to reason about flag gating when the flag-check middleware is declared
 * explicitly before the protected router.
 */
export const conditionalMiddleware = (
    condition: () => boolean,
    middleware: RequestHandler,
): RequestHandler => {
    return (req, res, next) => {
        if (condition()) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
};

/**
 * Short-circuit requests unless the given internal feature flag is enabled.
 *
 * Intended usage:
 * - Place this middleware before protected route handlers/routers.
 * - Return 404 when disabled, so downstream middlewares are not executed.
 *
 * Example:
 * `app.use('/api/signal-endpoint', requireEnabledFlag(config, 'signals'), router)`
 *
 * Ordering guidance:
 * - Put this before expensive middleware (for example rate limiting) when
 *   you want disabled features to bypass that work.
 */
export const requireEnabledFlag =
    (config: IUnleashConfig, flagName: IFlagKey): RequestHandler =>
    (_req, res, next) => {
        if (config.flagResolver.isEnabled(flagName)) {
            return next();
        }
        return res.sendStatus(404);
    };
