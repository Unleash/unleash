'use strict';

const url = require('url');

module.exports = function(config) {
    const logger = config.getLogger('HTTP');
    const enable = config.server.enableRequestLogger;
    return (req, res, next) => {
        if (enable) {
            res.on('finish', () => {
                const { pathname } = url.parse(req.originalUrl);
                logger.info(`${res.statusCode} ${req.method} ${pathname}`);
            });
        }
        next();
    };
};
