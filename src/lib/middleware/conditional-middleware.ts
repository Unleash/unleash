import { type RequestHandler, Router } from 'express';

export const conditionalMiddleware = (
    condition: () => boolean,
    middleware: RequestHandler,
): RequestHandler => {
    return (req, res, next) => {
        if (condition()) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
};
