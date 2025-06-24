import url from 'url';
import type { RequestHandler } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import {
    CLIENT_ERROR_COUNT,
    SERVER_ERROR_COUNT,
} from '../features/metrics/impact/define-impact-metrics.js';

const requestLogger: (config: IUnleashConfig) => RequestHandler = (config) => {
    const logger = config.getLogger('HTTP');
    const enable = config.server.enableRequestLogger;
    const impactMetrics = config.flagResolver.impactMetrics;
    return (req, res, next) => {
        if (enable) {
            res.on('finish', () => {
                const { pathname } = url.parse(req.originalUrl);
                if (res.statusCode >= 400 || res.statusCode < 500) {
                    impactMetrics?.incrementCounter(CLIENT_ERROR_COUNT);
                }
                if (res.statusCode >= 500) {
                    impactMetrics?.incrementCounter(SERVER_ERROR_COUNT);
                }
                logger.info(`${res.statusCode} ${req.method} ${pathname}`);
            });
        }
        next();
    };
};

export default requestLogger;
