import { IUnleashConfig } from '../types';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const patMiddleware = (
    {
        getLogger,
        authentication,
    }: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'flagResolver'>,
    { userService }: any,
): any => {
    const logger = getLogger('/middleware/pat-middleware.ts');
    logger.debug('Enabling PAT middleware');

    if (!authentication.enablePersonalAccessToken) {
        return (req, res, next) => next();
    }

    return (req, res, next) => {
        if (req.user) {
            return next();
        }

        try {
            const apiToken = req.header('authorization') as string;
            if (apiToken?.startsWith('user')) {
                const user = userService.getUserByPersonalAccessToken(apiToken);
                req.session.user = user;
            }
        } catch (error) {
            logger.error(error);
        }
        next();
    };
};

export default patMiddleware;
