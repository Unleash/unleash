import { ApiTokenType } from '../types/model.js';
import type { IUnleashConfig } from '../types/option.js';
import type { IApiRequest, IAuthRequest } from '../routes/unleash-types.js';
import type { IUnleashServices } from '../services/index.js';
import {
    NO_TOKEN_WHERE_TOKEN_WAS_REQUIRED,
    TOKEN_TYPE_ERROR_MESSAGE,
} from './api-token-middleware.js';

export const backendApiAccessMiddleware = (
    {
        getLogger,
        authentication,
        flagResolver,
    }: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'flagResolver'>,
    { apiTokenService }: Pick<IUnleashServices, 'apiTokenService'>,
): any => {
    const logger = getLogger('/middleware/backend-token-middleware.ts');
    logger.debug('Enabling backend-token middleware');
    if (!authentication.enableApiToken) {
        return (_req, _res, next) => next();
    }

    return async (req: IAuthRequest | IApiRequest, res, next) => {
        const onlyFeatureTokensWithFeatureAPIs = flagResolver.isEnabled(
            'onlyFeatureTokensWithFeatureAPIs',
        );
        // Defer to api-token-middleware
        if (!onlyFeatureTokensWithFeatureAPIs) {
            return next();
        }

        try {
            const apiToken = req.header('authorization');
            if (!apiToken) {
                res.status(401).send({
                    message: NO_TOKEN_WHERE_TOKEN_WAS_REQUIRED,
                });
                return;
            }

            // Disallow PAT/Service account tokens and admin tokens
            if (apiToken.startsWith('user:') || apiToken.startsWith('*:*')) {
                res.status(403).send({
                    message: TOKEN_TYPE_ERROR_MESSAGE,
                });
                return;
            }

            const apiUser = apiToken
                ? await apiTokenService.getUserForToken(apiToken)
                : undefined;
            const { CLIENT, BACKEND } = ApiTokenType;

            if (apiUser) {
                if (apiUser.type !== CLIENT && apiUser.type !== BACKEND) {
                    res.status(403).send({
                        message: TOKEN_TYPE_ERROR_MESSAGE,
                    });
                    return;
                }
                req.user = apiUser;
                next();
            } else {
                res.status(401).send({
                    message: NO_TOKEN_WHERE_TOKEN_WAS_REQUIRED,
                });
                return;
            }
        } catch (error) {
            logger.warn(error);
            res.status(401).send({
                message: NO_TOKEN_WHERE_TOKEN_WAS_REQUIRED,
            });
            return;
        }
    };
};

export default backendApiAccessMiddleware;
