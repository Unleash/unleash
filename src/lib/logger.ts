import { configure, getLogger, levels } from 'log4js';

export type LogProvider = (category?: string) => Logger;

export interface Logger {
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    fatal(message: any, ...args: any[]): void;
}

function getDefaultLogProvider(): LogProvider {
    let level: string;
    if (process.env.NODE_ENV === 'production') {
        level = levels.ERROR.levelStr;
    } else if (process.env.NODE_ENV === 'test') {
        level = levels.FATAL.levelStr;
    } else {
        level = levels.DEBUG.levelStr;
    }

    configure({
        appenders: {
            console: { type: 'console' },
        },
        categories: {
            default: { appenders: ['console'], level },
        },
    });

    return getLogger;
}

function validate(isValid: boolean, msg: string) {
    if (!isValid) {
        throw new TypeError(msg);
    }
}

export function validateLogProvider(provider: LogProvider): void {
    validate(typeof provider === 'function', 'Provider needs to be a function');

    const logger = provider('unleash:logger');
    validate(typeof logger.debug === 'function', 'Logger must implement debug');
    validate(typeof logger.info === 'function', 'Logger must implement info');
    validate(typeof logger.warn === 'function', 'Logger must implement warn');
    validate(typeof logger.error === 'function', 'Logger must implement error');
}

// Deprecated
let loggerProvider = getDefaultLogProvider();
export const defaultLogProvider = loggerProvider;

export function setLoggerProvider(provider: LogProvider): void {
    validateLogProvider(provider);

    loggerProvider = provider;
    const logger = provider('unleash:logger');
    logger.info(`Your way of configuring a logProvider is deprecated. 
        See https://docs.getunleash.io/docs/deploy/configuring_unleash for details`);
}
