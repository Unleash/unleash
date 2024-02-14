import { Logger } from '../logger';
import { IUnleash } from '../types/core';
import { GenericUnleashError } from '../error/unleash-error';

const shutdownHooks: Map<string, () => Promise<void>> = new Map<
    string,
    () => Promise<void>
>();

export function resetShutdownHooks() {
    shutdownHooks.clear();
}
export function registerGracefulShutdownHook(
    logger: Logger,
    serviceName: string,
    hook: () => Promise<void>,
): void {
    logger.info(`Registering graceful shutdown for ${serviceName}`);
    if (shutdownHooks.has(serviceName)) {
        throw new GenericUnleashError({
            name: 'DuplicateShutdownHook',
            message: `${serviceName} already registered for graceful shutdown`,
            statusCode: 500,
        });
    }
    shutdownHooks.set(serviceName, hook);
}

export async function executeShutdownHooks(logger?: Logger): Promise<void> {
    for (const [hookName, hook] of shutdownHooks.entries()) {
        logger?.info(`Shutting down ${hookName}`);
        try {
            await hook();
            shutdownHooks.delete(hookName);
            logger?.info(`Done shutting down ${hookName}`);
        } catch (e) {
            logger?.error(`Shutdown hook ${hookName} failed`, e);
        }
    }
}

export function registerGracefulShutdown(
    unleash: IUnleash,
    logger: Logger,
): void {
    const unleashCloser = (signal: string) => async () => {
        try {
            logger.info(`Graceful shutdown signal (${signal}) received.`);
            await unleash.stop();
            logger.info('Unleash has been successfully stopped.');
            process.exit(0);
        } catch (e) {
            logger.error('Unable to shutdown Unleash. Hard exit!');
            process.exit(1);
        }
    };

    logger.debug('Registering graceful shutdown');

    process.on('SIGINT', unleashCloser('SIGINT'));
    process.on('SIGHUP', unleashCloser('SIGHUP'));
    process.on('SIGTERM', unleashCloser('SIGTERM'));
}
