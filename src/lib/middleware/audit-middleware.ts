import type { IUnleashConfig } from '../types/index.js';
import type { IApiRequest, IAuthRequest } from '../routes/unleash-types.js';
import { extractAuditInfo } from '../util/index.js';

export const auditAccessMiddleware = ({
    getLogger,
}: Pick<IUnleashConfig, 'getLogger'>): any => {
    const logger = getLogger('/middleware/audit-middleware.ts');
    return (req: IAuthRequest | IApiRequest, _res, next) => {
        if (!req.user) {
            logger.info('Could not find user');
        } else {
            try {
                req.audit = extractAuditInfo(req);
            } catch (_e) {
                logger.warn('Could not find audit info in request');
            }
        }
        next();
    };
};
