'use strict';

const log4js = require('log4js');

function getDefaultLogProvider() {
    let level;
    if (process.env.NODE_ENV === 'production') {
        level = log4js.levels.ERROR.levelStr;
    } else if (process.env.NODE_ENV === 'test') {
        level = log4js.levels.FATAL.levelStr;
    } else {
        level = log4js.levels.DEBUG.levelStr;
    }

    log4js.configure({
        appenders: {
            console: { type: 'console' },
        },
        categories: {
            default: { appenders: ['console'], level },
        },
    });

    return log4js.getLogger;
}

let loggerProvider = getDefaultLogProvider();

function validate(isValid, msg) {
    if (!isValid) {
        throw new TypeError(msg);
    }
}

module.exports.defaultLogProvider = loggerProvider;

function validateLogProvider(provider) {
    validate(typeof provider === 'function', 'Provider needs to be a function');

    const logger = provider('unleash:logger');
    validate(typeof logger.debug === 'function', 'Logger must implement debug');
    validate(typeof logger.info === 'function', 'Logger must implement info');
    validate(typeof logger.warn === 'function', 'Logger must implement warn');
    validate(typeof logger.error === 'function', 'Logger must implement error');
}

exports.validateLogProvider = validateLogProvider;

// Deprecated
exports.setLoggerProvider = function setLoggerProvider(provider) {
    validateLogProvider(provider);

    loggerProvider = provider;
    const logger = provider('unleash:logger');
    logger.info(`Your way of configuring a logProvider is depreacted. 
        See https://unleash.github.io/docs/getting_started for details`);
};
