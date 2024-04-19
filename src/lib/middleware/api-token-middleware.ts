import { ApiTokenType } from '../types/models/api-token';
import type { IUnleashConfig } from '../types/option';
import type { IApiRequest, IAuthRequest } from '../routes/unleash-types';
import type { IUnleashServices } from '../server-impl';

const isClientApi = ({ path }) => {
    return path && path.indexOf('/api/client') > -1;
};

const isEdgeMetricsApi = ({ path }) => {
    return path && path.indexOf('/edge/metrics') > -1;
};

const isProxyApi = ({ path }) => {
    if (!path) {
        return;
    }

    // Handle all our current proxy paths which will redirect to the new
    // embedded proxy endpoint
    return (
        path.indexOf('/api/proxy') > -1 ||
        path.indexOf('/api/development/proxy') > -1 ||
        path.indexOf('/api/production/proxy') > -1 ||
        path.indexOf('/api/frontend') > -1
    );
};

export const TOKEN_TYPE_ERROR_MESSAGE =
    'invalid token: expected a different token type for this endpoint';

export const NO_TOKEN_WHERE_TOKEN_WAS_REQUIRED =
    'This endpoint requires an API token. Please add an authorization header to your request with a valid token';
const apiAccessMiddleware = (
    {
        getLogger,
        authentication,
        flagResolver,
    }: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'flagResolver'>,
    { apiTokenService }: Pick<IUnleashServices, 'apiTokenService'>,
): any => {
    const logger = getLogger('/middleware/api-token.ts');
    logger.debug('Enabling api-token middleware');

    if (!authentication.enableApiToken) {
        return (req, res, next) => next();
    }

    return async (req: IAuthRequest | IApiRequest, res, next) => {
        if (req.user) {
            return next();
        }

        try {
            const apiToken = req.header('authorization');
            if (!apiToken?.startsWith('user:')) {
                const apiUser = apiToken
                    ? await apiTokenService.getUserForToken(apiToken)
                    : undefined;
                const { CLIENT, FRONTEND } = ApiTokenType;

                if (apiUser) {
                    if (
                        (apiUser.type === CLIENT &&
                            !isClientApi(req) &&
                            !isEdgeMetricsApi(req)) ||
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
                } else if (isClientApi(req) || isProxyApi(req)) {
                    // If we're here, we know that api token middleware was enabled, otherwise we'd returned a no-op middleware
                    // We explicitly only protect client and proxy apis, since admin apis are protected by our permission checker
                    // Reject with 401
                    res.status(401).send({
                        message: NO_TOKEN_WHERE_TOKEN_WAS_REQUIRED,
                    });
                    return;
                }
            }
        } catch (error) {
            logger.warn(error);
        }
        next();
    };
};

export default apiAccessMiddleware;
