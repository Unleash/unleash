/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IUnleashConfig } from '../types/core';

const apiAccessMiddleware = (
    config: IUnleashConfig,
    { apiTokenService }: any,
): any => {
    const logger = config.getLogger('/middleware/api-token.ts');
    logger.info('Enabling api-token middleware');

    return async (req, res, next) => {
        if (req.user) {
            return next();
        }

        try {
            const userToken = req.header('authorization');
            const user = await apiTokenService.getUserForToken(userToken);
            if (user) {
                req.user = user;
            }
        } catch (error) {
            logger.error(error);
        }

        return next();
    };
};

module.exports = apiAccessMiddleware;
export default apiAccessMiddleware;
