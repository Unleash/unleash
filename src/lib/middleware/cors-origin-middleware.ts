import { RequestHandler } from 'express';
import cors from 'cors';

const ANY_ORIGIN = '*';

export const allowRequestOrigin = (
    requestOrigin: string,
    allowedOrigins: string[],
): boolean => {
    return allowedOrigins.some((allowedOrigin) => {
        return allowedOrigin === requestOrigin || allowedOrigin === ANY_ORIGIN;
    });
};

// Check the request's Origin header against a list of allowed origins.
// The list may include '*', which `cors` does not support natively.
export const corsOriginMiddleware = (
    allowedOrigins: string[],
): RequestHandler => {
    return cors((req, callback) => {
        callback(null, {
            origin: allowRequestOrigin(req.header('Origin'), allowedOrigins),
        });
    });
};
