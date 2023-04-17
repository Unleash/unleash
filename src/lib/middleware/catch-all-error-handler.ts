import { ErrorRequestHandler } from 'express';
import { LogProvider } from '../logger';
import { handleErrors } from '../routes/util';

export const catchAllErrorHandler = (
    logProvider: LogProvider,
): ErrorRequestHandler => {
    const logger = logProvider('/debug-error-handler.ts');
    // should not remove next as express needs 4 parameters to distinguish error handler from regular handler
    /* eslint-disable @typescript-eslint/no-unused-vars */
    return (err, req, res, next) => {
        handleErrors(res, logger, err);
    };
};
