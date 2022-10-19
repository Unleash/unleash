/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ApiTokenType } from '../types/models/api-token';
import { IUnleashConfig } from '../types/option';
import { IAuthRequest } from '../routes/unleash-types';

const isClientApi = ({ path }) => {
    return path && path.startsWith('/api/client');
};

const isProxyApi = ({ path }) => {
    if (!path) {
        return;
    }

    // Handle all our current proxy paths which will redirect to the new
    // embedded proxy endpoint
    return (
        path.startsWith('/api/proxy') ||
        path.startsWith('/api/development/proxy') ||
        path.startsWith('/api/production/proxy') ||
        path.startsWith('/api/frontend')
    );
};

export const TOKEN_TYPE_ERROR_MESSAGE =
    'invalid token: expected a different token type for this endpoint';

const apiAccessMiddleware = (
    {
        getLogger,
        authentication,
        flagResolver,
    }: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'flagResolver'>,
    { apiTokenService }: any,
): any => {
    const logger = getLogger('/middleware/api-token.ts');
    logger.debug('Enabling api-token middleware');

    if (!authentication.enableApiToken) {
        return (req, res, next) => next();
    }

    return (req: IAuthRequest, res, next) => {
        if (req.user) {
            return next();
        }

        try {
            const apiToken = req.header('authorization');
            if (!apiToken?.startsWith('user:')) {
                const apiUser = apiTokenService.getUserForToken(apiToken);
                const { CLIENT, FRONTEND } = ApiTokenType;

                if (apiUser) {
                    if (
                        (apiUser.type === CLIENT && !isClientApi(req)) ||
                        (apiUser.type === FRONTEND && !isProxyApi(req)) ||
                        (apiUser.type === FRONTEND &&
                            !flagResolver.isEnabled('embedProxy'))
                    ) {
                        res.status(403).send({
                            message: TOKEN_TYPE_ERROR_MESSAGE,
                        });
                        return;
                    }
                    req.user = apiUser;
                }
            }
        } catch (error) {
            logger.error(error);
        }

        next();
    };
};

export default apiAccessMiddleware;
