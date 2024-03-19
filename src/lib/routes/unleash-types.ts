import type { Request } from 'express';
import type { IUser } from '../types/user';
import type { IApiUser } from '../types';

export interface IAuthRequest<
    PARAM = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: IUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
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
}

export interface RequestBody<T> extends Express.Request {
    body: T;
}
