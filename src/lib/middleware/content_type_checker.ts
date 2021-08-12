import { RequestHandler } from 'express';

const DEFAULT_ACCEPTED_CONTENT_TYPE = 'application/json';

/**
 * Builds an express middleware checking the content-type header
 * returning 415 if the header is not either `application/json` or in the array
 * passed into the function of valid content-types
 * @param {String} acceptedContentTypes
 * @returns {function(Request, Response, NextFunction): void}
 */
export default function requireContentType(
    ...acceptedContentTypes: string[]
): RequestHandler {
    return (req, res, next) => {
        const contentType = req.header('Content-Type');
        if (
            Array.isArray(acceptedContentTypes) &&
            acceptedContentTypes.length > 0
        ) {
            if (acceptedContentTypes.includes(contentType)) {
                next();
            } else {
                res.status(415).end();
            }
        } else if (DEFAULT_ACCEPTED_CONTENT_TYPE === contentType) {
            next();
        } else {
            res.status(415).end();
        }
    };
}

module.exports = requireContentType;
