import { RequestHandler, Router } from 'express';

export const conditionalMiddleware = (
    condition: () => boolean,
    middleware: RequestHandler,
): RequestHandler => {
    const router = Router();

    router.use((req, res, next) => {
        if (condition()) {
            next();
        } else {
            res.status(404).send({ message: 'Not found' });
        }
    });

    router.use(middleware);
    return router;
};
