import { Application } from 'express';
import authorizationMiddleware from './authorization-middleware';
import { LogProvider } from '../logger';

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
