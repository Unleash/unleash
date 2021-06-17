import { Logger } from '../logger';
import { IUnleash } from '../types/core';

function registerGracefulShutdown(unleash: IUnleash, logger: Logger): void {
    const unleashCloser = (signal: string) => async () => {
        try {
            logger.info(`Graceful shutdown signal (${signal}) received.`);
            await unleash.stop();
            logger.info('Unleash has been successfully stopped.');
            process.exit(0);
        } catch (e) {
            logger.error('Unable to shutdown Unleash. Hard exit!', e);
            process.exit(1);
        }
    };

    logger.info('Registering graceful shutdown');

    process.on('SIGUSR2', () => process.exit(0));
    process.on('SIGINT', unleashCloser('SIGINT'));
    process.on('SIGHUP', unleashCloser('SIGHUP'));
    process.on('SIGTERM', unleashCloser('SIGTERM'));
}

export default registerGracefulShutdown;
