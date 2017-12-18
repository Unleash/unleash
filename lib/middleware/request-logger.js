'use strict';

const url = require('url');
const logger = require('../logger')('HTTP');

module.exports = function(config) {
    return (req, res, next) => {
        next();
        if (config.enableRequestLogger) {
            const { pathname } = url.parse(req.originalUrl);
            logger.info(`${res.statusCode} ${req.method} ${pathname}`);
        }
    };
};
