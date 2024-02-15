import { Application } from 'express';
import NoAuthUser from '../types/no-auth-user';
import { ApiTokenType } from '../types/models/api-token';
import { ApiUser } from '../server-impl';

// eslint-disable-next-line
function noneAuthentication(baseUriPath: string, app: Application): void {
    app.use(`${baseUriPath || ''}/api/admin/`, (req, res, next) => {
        // @ts-expect-error
        if (!req.user) {
            // @ts-expect-error
            req.user = new NoAuthUser();
        }
        next();
    });
}

export function noApiToken(baseUriPath: string, app: Application) {
    app.use(`${baseUriPath}/api/frontend`, (req, res, next) => {
        //@ts-ignore
        if (!req.headers.authorization && !req.user) {
            //@ts-ignore
            req.user = new ApiUser({
                tokenName: 'unknown',
                permissions: [],
                projects: ['*'],
                environment: 'default',
                type: ApiTokenType.FRONTEND,
                secret: 'unknown',
            });
        }
        next();
    });
    app.use(`${baseUriPath}/api/client`, (req, res, next) => {
        //@ts-ignore
        if (!req.headers.authorization && !req.user) {
            //@ts-ignore
            req.user = new ApiUser({
                tokenName: 'unknown',
                permissions: [],
                projects: ['*'],
                environment: 'default',
                type: ApiTokenType.CLIENT,
                secret: 'unknown',
            });
        }
        next();
    });
}
export default noneAuthentication;
