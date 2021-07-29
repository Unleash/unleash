import { Application } from 'express';
import { ADMIN } from '../types/permissions';
import ApiUser from '../types/api-user';

function noneAuthentication(basePath = '', app: Application): void {
    app.use(`${basePath}/api/admin/`, (req, res, next) => {
        // @ts-ignore
        if (!req.user) {
            // @ts-ignore
            req.user = new ApiUser({
                username: 'unknown',
                permissions: [ADMIN],
            });
        }
        next();
    });
}
export default noneAuthentication;
