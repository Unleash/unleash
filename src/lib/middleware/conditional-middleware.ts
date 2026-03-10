import type { RequestHandler } from 'express';
import type { IFlagResolver, IFlagKey } from '../types/index.js';

/**
 * @deprecated Use `requireFeatureEnabled` for feature-flag route gating.
 *
 * Generic conditional middleware runner.
 * Prefer this only for non-feature-flag conditions.
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
 * Route-level feature gate middleware.
 *
 * Recommended usage:
 * `middleware: [requireFeatureEnabled(config.flagResolver, 'myFlag')]`
 *
 * Guidance:
 * - Prefer route-level usage (`this.route({ middleware: [...] })`) in controllers.
 * - Avoid broad prefix mounts (for example `/api/admin/projects`) where sibling routes
 *   can accidentally be gated.
 * - The route remains registered/discoverable; disabled features return `404` at request time.
 */
export const requireFeatureEnabled = (
    flagResolver: Pick<IFlagResolver, 'isEnabled'>,
    flagName: IFlagKey,
): RequestHandler => {
    return (_req, res, next) => {
        if (flagResolver.isEnabled(flagName)) {
            return next();
        }
        return res.sendStatus(404);
    };
};
