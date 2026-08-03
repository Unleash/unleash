import type { IUnleashConfig } from '../types/index.js';
import type { IAuthRequest } from '../routes/unleash-types.js';
import NotFoundError from '../error/notfound-error.js';
import type { AccountService } from '../services/account-service.js';
import {
    AuthorizationTokenKind,
    parseAuthorizationToken,
} from '../authentication/authorization-token.js';

const patMiddleware = (
    { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    { accountService }: { accountService: AccountService },
): any => {
    const logger = getLogger('/middleware/pat-middleware.ts');
    logger.debug('Enabling PAT middleware');

    return async (req: IAuthRequest, _res, next) => {
        try {
            const apiToken = req.header('authorization');
            const parsedToken = parseAuthorizationToken(apiToken);
            if (parsedToken?.kind === AuthorizationTokenKind.USER_ACCESS) {
                const user =
                    await accountService.getAccountByPersonalAccessToken(
                        parsedToken.secret,
                    );
                req.user = user;
                accountService.addPATSeen(parsedToken.secret);
            }
        } catch (error) {
            if (error instanceof NotFoundError) {
                logger.warn(
                    'Tried to use a PAT token for user that no longer existed',
                    error,
                );
            } else {
                logger.error(error);
            }
        }
        next();
    };
};

export default patMiddleware;
