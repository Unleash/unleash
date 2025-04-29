import type { Application } from 'express';
import authorizationMiddleware from './authorization-middleware.js';
import type { LogProvider } from '../logger.js';

function ossAuthHook(
    app: Application,
    getLogger: LogProvider,
    baseUriPath: string,
): void {
    app.use(
        `${baseUriPath}/api`,
        authorizationMiddleware(getLogger, baseUriPath),
    );
    app.use(
        `${baseUriPath}/logout`,
        authorizationMiddleware(getLogger, baseUriPath),
    );
}
export default ossAuthHook;
