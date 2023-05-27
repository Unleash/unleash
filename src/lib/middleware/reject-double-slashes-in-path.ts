import { RequestHandler } from 'express';

const MULTIPLE_SLASHES = /\/\/+/;

export const rejectDoubleSlashesInPath: RequestHandler = (req, res, next) => {
    if (req.path.match(MULTIPLE_SLASHES)) {
        res.status(404).send();
    } else {
        next();
    }
};
