/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IUnleashConfig } from '../types/option';

const apiAccessMiddleware = (
    {
        getLogger,
        authentication,
    }: Pick<IUnleashConfig, 'getLogger' | 'authentication'>,
    { apiTokenService }: any,
): any => {
    const logger = getLogger('/middleware/api-token.ts');
    logger.info('Enabling api-token middleware');

    if (!authentication.enableApiToken) {
        return (req, res, next) => next();
    }

    return (req, res, next) => {
        if (req.apiUser) {
            return next();
        }

        try {
            const apiToken = req.header('authorization');
            const apiUser = apiTokenService.getUserForToken(apiToken);
            if (apiUser) {
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
