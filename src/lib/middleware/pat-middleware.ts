import { IUnleashConfig } from '../types';
import { IAuthRequest } from '../routes/unleash-types';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const patMiddleware = (
    {
        getLogger,
        flagResolver,
    }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    { userService }: any,
): any => {
    const logger = getLogger('/middleware/pat-middleware.ts');
    logger.debug('Enabling PAT middleware');

    if (!flagResolver.isEnabled('personalAccessTokens')) {
        return (req, res, next) => next();
    }

    return async (req: IAuthRequest, res, next) => {
        try {
            const apiToken = req.header('authorization');
            if (apiToken?.startsWith('user:')) {
                const user = await userService.getUserByPersonalAccessToken(
                    apiToken,
                );
                req.user = user;
            }
        } catch (error) {
            logger.error(error);
        }
        next();
    };
};

export default patMiddleware;
