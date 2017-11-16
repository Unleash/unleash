'use strict';

const logger = require('../logger')('HTTP');

module.exports = function(config) {
    return (req, res, next) => {
        next();
        if (config.enableRequestLogger) {
            logger.info(`${res.statusCode} ${req.method} ${req.baseUrl}`);
        }
    };
};
