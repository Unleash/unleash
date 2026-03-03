import type {
    IApiRequest,
    IAuthRequest,
    IUnleashConfig,
} from '../server-impl.js';

export const userTokenClientApiLogger = ({
    getLogger,
    flagResolver,
}: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>): any => {
    return async (req: IAuthRequest | IApiRequest, res, next) => {
        const logger = getLogger(
            '/middleware/user-token-client-api-logger-middleware.ts',
        );
        const apiToken = req.header('authorization');
        if (
            apiToken?.startsWith('user:') &&
            flagResolver.isEnabled('userTokenWithClientApiLogging')
        ) {
            logger.info(`In the next version update, calling API endpoints under /api/client/ using Personal Access Tokens and Service Accounts will no longer be supported.
            Please update your integrations to use the new supported authentication method before upgrading to avoid service disruption.`);
        }
        next();
    };
};
