import url from 'url';
import type { RequestHandler } from 'express';
import type { IUnleashConfig } from '../types/option';

const requestLogger: (config: IUnleashConfig) => RequestHandler = (config) => {
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

export default requestLogger;
