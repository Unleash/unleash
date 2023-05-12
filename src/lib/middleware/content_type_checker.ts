import { RequestHandler } from 'express';
import { is } from 'type-is';
import ContentTypeError from '../error/content-type-error';

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
    if (acceptedContentTypes.length === 0) {
        acceptedContentTypes.push(DEFAULT_ACCEPTED_CONTENT_TYPE);
    }
    return (req, res, next) => {
        const contentType = req.header('Content-Type');
        if (is(contentType, acceptedContentTypes)) {
            next();
        } else {
            const error = new ContentTypeError(
                acceptedContentTypes as [string, ...string[]],
                contentType,
            );
            res.status(error.statusCode).json(error).end();
        }
    };
}
