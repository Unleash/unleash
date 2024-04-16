import type { IUnleashConfig } from '../types';
import type { IApiRequest, IAuthRequest } from '../routes/unleash-types';
import { extractAuditInfo } from '../util';

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
            } catch (e) {
                logger.warn('Could not find audit info in request');
            }
        }
        next();
    };
};
