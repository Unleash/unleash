import { IUnleashConfig } from '../types/option';
import { IUnleashServices } from '../types';

const patMiddleware = (
    {
        getLogger,
    }: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'flagResolver'>,
    { userService }: IUnleashServices,
): any => {
    const logger = getLogger('/middleware/pat-middleware.ts');
    logger.debug('Enabling api-token middleware');

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
