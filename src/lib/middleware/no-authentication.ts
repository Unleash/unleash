import type { Application } from 'express';
import NoAuthUser from '../types/no-auth-user';
import { ApiTokenType } from '../types/models/api-token';
import {
    ApiUser,
    type IApiRequest,
    type IAuthRequest,
    permissions,
} from '../server-impl';
import { DEFAULT_ENV } from '../util';

// eslint-disable-next-line
function noneAuthentication(baseUriPath: string, app: Application): void {
    app.use(
        `${baseUriPath || ''}/api/admin/`,
        (req: IAuthRequest, res, next) => {
            if (!req.user) {
                req.user = new NoAuthUser();
            }
            next();
        },
    );
}

export function noApiToken(baseUriPath: string, app: Application) {
    app.use(`${baseUriPath}/api/frontend`, (req: IApiRequest, res, next) => {
        if (!req.headers.authorization && !req.user) {
            req.user = new ApiUser({
                tokenName: 'unknown',
                permissions: [permissions.FRONTEND],
                projects: ['*'],
                environment: DEFAULT_ENV,
                type: ApiTokenType.FRONTEND,
                secret: 'unknown',
            });
        }
        next();
    });
    app.use(`${baseUriPath}/api/client`, (req: IApiRequest, res, next) => {
        if (!req.headers.authorization && !req.user) {
            req.user = new ApiUser({
                tokenName: 'unknown',
                permissions: [permissions.CLIENT],
                projects: ['*'],
                environment: DEFAULT_ENV,
                type: ApiTokenType.CLIENT,
                secret: 'unknown',
            });
        }
        next();
    });
}
export default noneAuthentication;
