import type { Request, Response, NextFunction } from 'express';

export const bearerTokenMiddleware = (
    req: Request,
    _: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        req.headers.authorization = authHeader.replace(/^Bearer\s+/i, '');
    }

    next();
};
