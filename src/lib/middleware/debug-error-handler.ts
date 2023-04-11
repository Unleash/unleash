import { ErrorRequestHandler } from 'express';
import { LogProvider } from '../logger';
import { handleErrors } from '../routes/util';

export const debugErrorHandler = (
    logProvider: LogProvider,
): ErrorRequestHandler => {
    const logger = logProvider('/debug-error-handler.ts');
    return (err, req, res) => {
        handleErrors(res, logger, err);
    };
};
