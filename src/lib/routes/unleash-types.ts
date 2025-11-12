import type { Request } from 'express';
import type { ParamsDictionary, Query } from 'express-serve-static-core';
import type { IAuditUser, IUser } from '../types/user.js';
import type { IApiUser } from '../types/index.js';

export interface IAuthRequest<
    PARAM extends ParamsDictionary = ParamsDictionary,
    ResBody = any, // TODO: consider `unknown` later to enforce explicit typing of res bodies
    ReqBody = any, // TODO: consider `unknown` later to force narrowing/validation of req bodies
    ReqQuery extends Query = Query,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: IUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
    audit: IAuditUser;
}

export interface IApiRequest<
    PARAM extends ParamsDictionary = ParamsDictionary,
    ResBody = any, // TODO: consider `unknown` later to enforce explicit typing of res bodies
    ReqBody = any, // TODO: consider `unknown` later to force narrowing/validation of req bodies
    ReqQuery extends Query = Query,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: IApiUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
    audit: IAuditUser;
}

export interface RequestBody<T> extends Express.Request {
    body: T;
}
