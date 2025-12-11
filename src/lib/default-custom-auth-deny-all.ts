import type { Express } from 'express';
import type { IUnleashConfig } from './types/option.js';

const customAuthWarning =
    'You have to configure a custom authentication middleware. Read https://docs.getunleash.io/docs/reference/deploy/configuring-unleash for more details';

export function defaultCustomAuthDenyAll(
    app: Express,
    config: IUnleashConfig,
): void {
    const logger = config.getLogger('src/lib/app/customAuthHandler');
    app.use(`${config.server.baseUriPath}/api`, async (_req, res) => {
        logger.error(customAuthWarning);
        res.status(401).send({
            error: customAuthWarning,
        });
    });
}
