import { Request } from 'express';
import User from '../types/user';

export interface IAuthRequest<
    PARAM = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: User;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
}

export interface RequestBody<T> extends Express.Request {
    body: T;
}
