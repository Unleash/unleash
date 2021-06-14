import { Logger } from '../logger';
import { IUnleash } from '../types/core';

function registerGracefulShutdown(unleash: IUnleash, logger: Logger): void {
    process.on('SIGINT', async () => {
        try {
            logger.info('Graceful shutdown signal (SIGINT) received.');
            await unleash.stop();
            process.exit(0);
        } catch (e) {
            logger.error('Unable to shutdown Unleash. Hard exit!', e);
            process.exit(1);
        }
    });

    process.on('SIGTERM', async () => {
        try {
            logger.info('Graceful shutdown signal (SIGTERM) received.');
            await unleash.stop();
            process.exit(0);
        } catch (e) {
            logger.error('Unable to shutdown Unleash. Hard exit!', e);
            process.exit(1);
        }
    });
}

export default registerGracefulShutdown;
