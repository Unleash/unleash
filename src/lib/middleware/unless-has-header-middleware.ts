import type { RequestHandler } from 'express';

export const unlessHasHeader =
    (header: string, middleware: RequestHandler): RequestHandler =>
    (req, res, next) => {
        if (req.headers[header]) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
