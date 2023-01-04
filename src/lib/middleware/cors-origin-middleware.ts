import { RequestHandler } from 'express';
import cors from 'cors';
import { IUnleashConfig, IUnleashServices } from '../types';

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
    { proxyService }: Pick<IUnleashServices, 'proxyService'>,
    config: IUnleashConfig,
): RequestHandler => {
    return cors(async (req, callback) => {
        try {
            const { frontendApiOrigins = [] } =
                await proxyService.getFrontendSettings();
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
};
