'use strict';

const log4js = require('log4js');

let loggerProvider = getDefaultLogProvider();

module.exports = exports = function getLogger(name) {
    return loggerProvider(name);
};

exports.setLoggerProvider = function setLoggerProvider(provider) {
    loggerProvider = provider;
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
        appenders: [{ type: 'console' }],
        levels: {
            '[all]': level,
        },
    });

    return log4js.getLogger;
}
