import { Application } from 'express';
import NoAuthUser from '../types/no-auth-user';

// eslint-disable-next-line
function noneAuthentication(basePath = '', app: Application): void {
    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        // @ts-expect-error
        if (!req.user) {
            // @ts-expect-error
            req.user = new NoAuthUser();
        }
        next();
    });
}
export default noneAuthentication;
