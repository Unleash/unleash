import type { Request } from 'express';
import type {
    Params,
    ParamsDictionary,
    Query,
} from 'express-serve-static-core';
import type { IAuditUser, IUser } from '../types/user.js';
import type { IApiUser } from '../types/index.js';

export interface IAuthRequest<
    PARAM extends Params = ParamsDictionary,
    ResBody = any, // TODO: consider `unknown` later to enforce explicit typing of res bodies
    ReqBody = any, // TODO: consider `unknown` later to force narrowing/validation of req bodies
    ReqQuery = Query,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: IUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
    audit: IAuditUser;
}

export interface IApiRequest<
    PARAM extends Params = ParamsDictionary,
    ResBody = any, // TODO: consider `unknown` later to enforce explicit typing of res bodies
    ReqBody = any, // TODO: consider `unknown` later to force narrowing/validation of req bodies
    ReqQuery = Query,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: IApiUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
    audit: IAuditUser;
}

export interface RequestBody<T>
    extends Request<ParamsDictionary, any, T, Query> {
    body: T;
}
