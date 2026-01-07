import type { ErrorRequestHandler } from 'express';
import type { LogProvider } from '../logger.js';
import { handleErrors } from '../routes/util.js';

export const catchAllErrorHandler = (
    logProvider: LogProvider,
): ErrorRequestHandler => {
    const logger = logProvider('/debug-error-handler.ts');
    // should not remove next as express needs 4 parameters to distinguish error handler from regular handler
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return (err, _req, res, _next) => {
        handleErrors(res, logger, err);
    };
};
