'use strict';

const url = require('url');

module.exports = function(config) {
    const logger = config.getLogger('HTTP');
    return (req, res, next) => {
        next();
        if (config.enableRequestLogger) {
            const { pathname } = url.parse(req.originalUrl);
            logger.info(`${res.statusCode} ${req.method} ${pathname}`);
        }
    };
};
