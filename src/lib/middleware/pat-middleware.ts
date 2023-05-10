import { IUnleashConfig } from '../types';
import { IAuthRequest } from '../routes/unleash-types';
import NotFoundError from '../error/notfound-error';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const patMiddleware = (
    { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    { accountService }: any,
): any => {
    const logger = getLogger('/middleware/pat-middleware.ts');
    logger.debug('Enabling PAT middleware');

    return async (req: IAuthRequest, res, next) => {
        try {
            const apiToken = req.header('authorization');
            if (apiToken?.startsWith('user:')) {
                const user =
                    await accountService.getAccountByPersonalAccessToken(
                        apiToken,
                    );
                req.user = user;
                accountService.addPATSeen(apiToken);
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
