'use strict';

const url = require('url');

module.exports = function(config) {
    const logger = config.getLogger('HTTP');
    return (req, res, next) => {
        if (config.enableRequestLogger) {
            res.on('finish', () => {
                const { pathname } = url.parse(req.originalUrl);
                logger.info(`${res.statusCode} ${req.method} ${pathname}`);
            });
        }
        next();
    };
};
