import { Application } from 'express';
import NoAuthUser from '../types/no-auth-user';
import NoAuthFrontendAPIUser from '../types/no-auth-frontend-api-user';
import NoAuthClientAPIUser from '../types/no-auth-client-api-user';

// eslint-disable-next-line
function noneAuthentication(basePath: string, app: Application): void {
    app.use(`${basePath || ''}/api/admin/`, (req, res, next) => {
        // @ts-expect-error
        if (!req.user) {
            // @ts-expect-error
            req.user = new NoAuthUser();
        }
        next();
    });
    app.use(`${basePath || ''}/api/frontend/`, (req, res, next) => {
        // @ts-expect-error
        if (!req.user) {
            // @ts-expect-error
            req.user = new NoAuthFrontendAPIUser();
        }
        next();
    });
    app.use(`${basePath || ''}/api/client`, (req, res, next) => {
        // @ts-expect-error
        if (!req.user) {
            // @ts-expect-error
            req.user = new NoAuthClientAPIUser();
        }
        next();
    });
}
export default noneAuthentication;
