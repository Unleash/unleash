import type {
    IApiRequest,
    IAuthRequest,
    IUnleashConfig,
} from '../server-impl.js';
import {
    AuthorizationTokenKind,
    parseAuthorizationToken,
} from '../authentication/authorization-token.js';

export const userTokenClientApiLogger = ({
    getLogger,
    flagResolver,
}: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>): any => {
    return async (req: IAuthRequest | IApiRequest, res, next) => {
        const logger = getLogger(
            '/middleware/user-token-client-api-logger-middleware.ts',
        );
        const apiToken = req.header('authorization');
        const parsedToken = parseAuthorizationToken(apiToken);
        if (
            (parsedToken?.kind === AuthorizationTokenKind.USER_ACCESS ||
                parsedToken?.kind === AuthorizationTokenKind.ADMIN_API_TOKEN) &&
            !flagResolver.isEnabled('userTokenWithClientApiLoggingKillSwitch')
        ) {
            logger.info(
                'In the next version update, calling API endpoints under /api/client/ using Personal Access Tokens, Service Accounts, or admin tokens will no longer be supported. Please update your integrations to use the new supported authentication method before upgrading to avoid service disruption.',
            );
        }
        next();
    };
};
