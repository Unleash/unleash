import type { RequestHandler } from 'express';
import cors from 'cors';
import type { IUnleashConfig } from '../types/index.js';
import type { IUnleashServices } from '../services/index.js';

export const resolveOrigin = (allowedOrigins: string[]): string | string[] => {
    if (allowedOrigins.length === 0) {
        return '*';
    }
    if (allowedOrigins.some((origin: string) => origin === '*')) {
        return '*';
    } else {
        return allowedOrigins;
    }
};

// Check the request's Origin header against a list of allowed origins.
// The list may include '*', which `cors` does not support natively.
export const corsOriginMiddleware = (
    { frontendApiService }: Pick<IUnleashServices, 'frontendApiService'>,
    config: IUnleashConfig,
): RequestHandler => {
    const corsFunc = cors(async (_req, callback) => {
        try {
            const { frontendApiOrigins = [] } =
                await frontendApiService.getFrontendSettings();
            callback(null, {
                origin: resolveOrigin(frontendApiOrigins),
                maxAge: config.accessControlMaxAge,
                exposedHeaders: 'ETag',
                credentials: true,
            });
        } catch (error) {
            callback(error);
        }
    });
    return (req, res, next) => {
        res.setHeader('Vary', 'Origin');
        corsFunc(req, res, next);
    };
};
