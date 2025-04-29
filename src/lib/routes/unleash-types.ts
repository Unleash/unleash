import type { Request } from 'express';
import type { IAuditUser, IUser } from '../types/user.js';
import type { IApiUser } from '../types/index.js';

export interface IAuthRequest<
    PARAM = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: IUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
    audit: IAuditUser;
}

export interface IApiRequest<
    PARAM = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: IApiUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
    audit: IAuditUser;
}

export interface RequestBody<T> extends Express.Request {
    body: T;
}
