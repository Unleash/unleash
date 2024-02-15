import { Logger, LogProvider } from '../logger';
import { IUnleash } from '../types/core';
import { GenericUnleashError } from '../error/unleash-error';

export interface IGracefulShutdown {
    registerGracefulShutdownHook(
        serviceName: string,
        hook: () => void | Promise<void>,
    ): void;
    resetShutdownHooks(): void;
    executeShutdownHooks(): Promise<void>;
}

export class GracefulShutdownHookManager implements IGracefulShutdown {
    private shutdownHooks: Map<string, () => void | Promise<void>>;
    private logger: Logger;
    constructor(getLogger: LogProvider) {
        this.shutdownHooks = new Map<string, () => void | Promise<void>>();
        this.logger = getLogger('/lib/util/graceful-shutdown.ts');
    }

    async executeShutdownHooks(): Promise<void> {
        for (const [hookName, hook] of this.shutdownHooks.entries()) {
            this.logger.info(`Shutting down ${hookName}`);
            try {
                await hook();
                this.shutdownHooks.delete(hookName);
                this.logger.info(`Done shutting down ${hookName}`);
            } catch (e) {
                this.logger.error(`Shutdown hook ${hookName} failed`, e);
            }
        }
    }

    registerGracefulShutdownHook(
        serviceName: string,
        hook: () => Promise<void>,
    ): void {
        this.logger.info(`Registering graceful shutdown for ${serviceName}`);
        if (this.shutdownHooks.has(serviceName)) {
            throw new GenericUnleashError({
                name: 'DuplicateShutdownHook',
                message: `${serviceName} already registered for graceful shutdown`,
                statusCode: 500,
            });
        }
        this.shutdownHooks.set(serviceName, hook);
    }

    resetShutdownHooks(): void {
        this.shutdownHooks.clear();
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
