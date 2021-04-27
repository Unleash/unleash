import { configure, getLogger } from 'log4js';

export type LogProvider = (category?: string) => Logger;

export enum LogLevel {
    debug = 'debug',
    info = 'info',
    warn = 'warn',
    error = 'error',
    fatal = 'fatal',
}

export interface Logger {
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    fatal(message: any, ...args: any[]): void;
}

export function getDefaultLogProvider(
    logLevel: LogLevel = LogLevel.error,
): LogProvider {
    configure({
        appenders: {
            console: { type: 'console' },
        },
        categories: {
            default: { appenders: ['console'], level: logLevel },
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
