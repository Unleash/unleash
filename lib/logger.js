'use strict';

const log4js = require('log4js');

let loggerProvider = getDefaultLogProvider();

module.exports = exports = function getLogger(name) {
    return loggerProvider(name);
};

exports.setLoggerProvider = function setLoggerProvider(provider) {
    validate(typeof provider == 'function', 'Provider needs to be a function');

    const logger = provider('unleash:logger');

    validate(typeof logger.debug == 'function', 'Logger must implement debug');
    validate(typeof logger.info == 'function', 'Logger must implement info');
    validate(typeof logger.warn == 'function', 'Logger must implement warn');
    validate(typeof logger.error == 'function', 'Logger must implement error');

    loggerProvider = provider;
    logger.info('Custom Logger Provider initalized.');
};

function getDefaultLogProvider() {
    let level;
    if (process.env.NODE_ENV === 'production') {
        level = log4js.levels.ERROR;
    } else if (process.env.NODE_ENV === 'test') {
        level = log4js.levels.FATAL;
    } else {
        level = log4js.levels.DEBUG;
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

function validate(isValid, msg) {
    if (!isValid) {
        throw new TypeError(msg);
    }
}
