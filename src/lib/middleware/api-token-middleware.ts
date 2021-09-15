/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ApiTokenType } from '../types/models/api-token';
import { IUnleashConfig } from '../types/option';

const isClientApi = ({ path }) => {
    return path && path.startsWith('/api/client');
};

const apiAccessMiddleware = (
    {
        getLogger,
        authentication,
    }: Pick<IUnleashConfig, 'getLogger' | 'authentication'>,
    { apiTokenService }: any,
): any => {
    const logger = getLogger('/middleware/api-token.ts');
    logger.debug('Enabling api-token middleware');

    if (!authentication.enableApiToken) {
        return (req, res, next) => next();
    }

    return (req, res, next) => {
        if (req.user) {
            return next();
        }

        try {
            const apiToken = req.header('authorization');
            const apiUser = apiTokenService.getUserForToken(apiToken);
            if (apiUser) {
                if (apiUser.type === ApiTokenType.CLIENT && !isClientApi(req)) {
                    return res.sendStatus(403);
                }
                req.user = apiUser;
            }
        } catch (error) {
            logger.error(error);
        }

        return next();
    };
};

module.exports = apiAccessMiddleware;
export default apiAccessMiddleware;
