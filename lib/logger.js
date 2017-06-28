'use strict';

const log4js = require('log4js');
log4js.configure({
    appenders: [{ type: 'console' }],
});

const logger = log4js.getLogger('unleash');

// TODO: make level configurable
if (process.env.NODE_ENV === 'production') {
    logger.setLevel(log4js.levels.ERROR);
} else if (process.env.NODE_ENV === 'test') {
    logger.setLevel(log4js.levels.ERROR);
} else {
    logger.setLevel(log4js.levels.DEBUG);
}

module.exports = logger;
