import { RequestHandler } from 'express';
import { statusCode, UnleashError } from '../error/api-error';
import { is } from 'type-is';

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
            const error = new UnleashError({
                name: 'ContentTypeError',
                message: `We do not accept the content-type you provided (${
                    contentType || "you didn't provide one"
                }).`,
                suggestion: `Try using one of the content-types we accept instead (${acceptedContentTypes.join(
                    ', ',
                )}) and make sure the body is in the corresponding format.`,
            });
            res.status(statusCode(error.name)).json(error).end();
        }
    };
}
