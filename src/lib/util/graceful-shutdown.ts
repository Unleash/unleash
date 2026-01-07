import type { Logger } from '../logger.js';
import type { IUnleash } from '../types/core.js';

function registerGracefulShutdown(unleash: IUnleash, logger: Logger): void {
    const unleashCloser = (signal: string) => async () => {
        try {
            logger.info(`Graceful shutdown signal (${signal}) received.`);
            await unleash.stop();
            logger.info('Unleash has been successfully stopped.');
            process.exit(0);
        } catch (_e) {
            console.log('Exiting with code 1');
            logger.error('Unable to shutdown Unleash. Hard exit!');
            process.exit(1);
        }
    };

    logger.debug('Registering graceful shutdown');

    process.on('SIGINT', unleashCloser('SIGINT'));
    process.on('SIGHUP', unleashCloser('SIGHUP'));
    process.on('SIGTERM', unleashCloser('SIGTERM'));
}

export default registerGracefulShutdown;
