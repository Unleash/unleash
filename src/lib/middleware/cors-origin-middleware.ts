import { RequestHandler } from 'express';
import cors from 'cors';
import { IUnleashServices } from '../types';

export const allowRequestOrigin = (
    requestOrigin: string,
    allowedOrigins: string[],
): boolean => {
    return allowedOrigins.some((allowedOrigin) => {
        return allowedOrigin === requestOrigin || allowedOrigin === '*';
    });
};

// Check the request's Origin header against a list of allowed origins.
// The list may include '*', which `cors` does not support natively.
export const corsOriginMiddleware = ({
    settingService,
}: Pick<IUnleashServices, 'settingService'>): RequestHandler => {
    return cors(async (req, callback) => {
        try {
            const { frontendApiOrigins = [] } =
                await settingService.getFrontendSettings();
            callback(null, {
                origin: allowRequestOrigin(
                    req.header('Origin'),
                    frontendApiOrigins,
                ),
            });
        } catch (error) {
            callback(error);
        }
    });
};
