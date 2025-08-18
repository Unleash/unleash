import type { Application } from 'express';
import NoAuthUser from '../types/no-auth-user.js';
import { ApiTokenType } from '../types/model.js';
import { DEFAULT_ENV } from '../util/index.js';
import type { IApiRequest, IAuthRequest } from '../routes/unleash-types.js';
import ApiUser from '../types/api-user.js';
import * as permissions from '../types/permissions.js';

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
                type: ApiTokenType.BACKEND,
                secret: 'unknown',
            });
        }
        next();
    });
}
export default noneAuthentication;
