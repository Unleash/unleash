import { IUnleashConfig } from '../types';
import { IAuthRequest } from '../routes/unleash-types';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const patMiddleware = (
    {
        getLogger,
        flagResolver,
    }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    { accountService }: any,
): any => {
    const logger = getLogger('/middleware/pat-middleware.ts');
    logger.debug('Enabling PAT middleware');

    return async (req: IAuthRequest, res, next) => {
        if (flagResolver.isEnabled('personalAccessTokensKillSwitch')) {
            next();
            return;
        }
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
            logger.error(error);
        }
        next();
    };
};

export default patMiddleware;
