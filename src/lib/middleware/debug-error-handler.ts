import { ErrorRequestHandler } from 'express';
import { LogProvider } from '../logger';

export const debugErrorHandler = (
    logProvider: LogProvider,
): ErrorRequestHandler => {
    const logger = logProvider('/debug-error-handler.ts');
    return (err, req, res, next) => {
        logger.error('Unhandled error', err);
        next(err);
    };
};
