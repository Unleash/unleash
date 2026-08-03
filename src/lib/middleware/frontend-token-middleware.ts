import { ApiTokenType } from '../types/model.js';
import { IAuthType, type IUnleashConfig } from '../types/option.js';
import type { IApiRequest, IAuthRequest } from '../routes/unleash-types.js';
import type { IUnleashServices } from '../services/index.js';
import {
    NO_TOKEN_WHERE_TOKEN_WAS_REQUIRED,
    TOKEN_TYPE_ERROR_MESSAGE,
} from './api-token-middleware.js';
import type { IApiUser } from '../types/index.js';
import {
    AuthorizationTokenKind,
    parseAuthorizationToken,
} from '../authentication/authorization-token.js';

export const frontendApiAccessMiddleware = (
    {
        getLogger,
        authentication,
        flagResolver,
    }: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'flagResolver'>,
    {
        apiTokenService,
        apiTokenV2Service,
    }: Pick<IUnleashServices, 'apiTokenService' | 'apiTokenV2Service'>,
): any => {
    const logger = getLogger('/middleware/frontend-token-middleware.ts');
    logger.debug('Enabling frontend-token middleware');
    if (
        !authentication.enableApiToken ||
        authentication.type === IAuthType.NONE
    ) {
        return (_req, _res, next) => next();
    }

    return async (req: IAuthRequest | IApiRequest, res, next) => {
        const allowDeprecatedApiTokenMiddleware = flagResolver.isEnabled(
            'allowDeprecatedApiTokenMiddleware',
        );
        // Defer to api-token-middleware
        if (allowDeprecatedApiTokenMiddleware) {
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

            // Feature APIs only accept backend or frontend API tokens.
            const parsedToken = parseAuthorizationToken(apiToken);
            if (parsedToken?.kind !== AuthorizationTokenKind.API_TOKEN) {
                res.status(403).send({
                    message: TOKEN_TYPE_ERROR_MESSAGE,
                });
                return;
            }

            let apiUser: IApiUser | undefined;
            if (parsedToken?.version === 'v2') {
                apiUser = await apiTokenV2Service.getUserForToken(parsedToken);
            } else if (parsedToken) {
                apiUser = await apiTokenService.getUserForToken(
                    parsedToken.secret,
                );
            }
            const { FRONTEND } = ApiTokenType;

            if (apiUser) {
                if (apiUser.type !== FRONTEND) {
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

export default frontendApiAccessMiddleware;
