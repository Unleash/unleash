import { IUnleashConfig } from './types/option';

const customAuthWarning =
    'You have to configure a custom authentication middleware. Read https://docs.getunleash.io/docs/deploy/configuring_unleash for more details';

export function defaultCustomAuthDenyAll(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    app: any,
    config: IUnleashConfig,
): void {
    const logger = config.getLogger('src/lib/app/customAuthHandler');
    app.use(`${config.server.baseUriPath}/api`, async (req, res) => {
        logger.error(customAuthWarning);
        res.status(401).send({
            error: customAuthWarning,
        });
    });
}
