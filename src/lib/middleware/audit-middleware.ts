import type { IAuditUser, IUnleashConfig } from '../types/index.js';
import type { IApiRequest, IAuthRequest } from '../routes/unleash-types.js';
import {
    extractUserId,
    extractUsername,
    extractClientIp,
    extractUserAgentFromHeaders,
} from '../util/extract-user.js';
import { sanitizeUserAgent } from '../util/sanitize-user-agent.js';

export const extractAuditInfo = (
    req: IAuthRequest | IApiRequest,
    { captureUserAgent }: { captureUserAgent: boolean },
): IAuditUser => ({
    id: extractUserId(req),
    username: extractUsername(req),
    ip: extractClientIp(req),
    userAgent: captureUserAgent
        ? sanitizeUserAgent(extractUserAgentFromHeaders(req))
        : undefined,
});

export const auditAccessMiddleware = ({
    getLogger,
    flagResolver,
}: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>): any => {
    const logger = getLogger('/middleware/audit-middleware.ts');
    return (req: IAuthRequest | IApiRequest, _res, next) => {
        if (!req.user) {
            logger.info('Could not find user');
        } else {
            try {
                /**
                 * Most GET/HEAD reqs create NONE audit-event today - so reading the
                 * header for them would only ever be dead work
                 */
                const mayCreateAuditEvent =
                    req.method !== 'GET' && req.method !== 'HEAD';

                req.audit = extractAuditInfo(req, {
                    captureUserAgent:
                        mayCreateAuditEvent &&
                        flagResolver.isEnabled('auditEventUserAgent'),
                });
            } catch (_e) {
                logger.warn('Could not find audit info in request');
            }
        }
        next();
    };
};
