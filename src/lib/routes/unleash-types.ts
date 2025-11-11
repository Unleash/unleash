import type { Request } from 'express';
import type { ParamsDictionary, Query } from 'express-serve-static-core';
import type { IAuditUser, IUser } from '../types/user.js';
import type { IApiUser } from '../types/index.js';

/**
 * Normalizes a provided params shape to a ParamsDictionary-compatible type:
 * - If P is undefined, fall back to ParamsDictionary (ergonomic "don't care" default)
 * - If P is an object shape, treat its keys as present string params and also keep
 *   the index signature from ParamsDictionary for any other keys
 * This lets callers pass a narrow interface (subset of keys, even with optional or non-string
 * annotations) while ensuring req.params remains stringly-typed as Express provides.
 */
type EffectiveParams<P> = [P] extends [undefined]
    ? ParamsDictionary
    : ParamsDictionary & { [K in keyof P]-?: string };

/**
 * Normalizes query generic: if Q is undefined, use Express' default Query type.
 */
type EffectiveQuery<Q> = [Q] extends [undefined] ? Query : Q;

export interface IAuthRequest<
    PARAM = undefined,
    ResBody = any, // TODO: consider `unknown` later to enforce explicit typing of res bodies
    ReqBody = any, // TODO: consider `unknown` later to force narrowing/validation of req bodies
    ReqQuery = undefined,
> extends Request<
        EffectiveParams<PARAM>,
        ResBody,
        ReqBody,
        EffectiveQuery<ReqQuery>
    > {
    user: IUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
    audit: IAuditUser;
}

export interface IApiRequest<
    PARAM = undefined,
    ResBody = any, // TODO: consider `unknown` later to enforce explicit typing of res bodies
    ReqBody = any, // TODO: consider `unknown` later to force narrowing/validation of req bodies
    ReqQuery = undefined,
> extends Request<
        EffectiveParams<PARAM>,
        ResBody,
        ReqBody,
        EffectiveQuery<ReqQuery>
    > {
    user: IApiUser;
    logout: (() => void) | ((callback: (err?: any) => void) => void);
    session: any;
    audit: IAuditUser;
}

export interface RequestBody<T>
    extends Request<ParamsDictionary, any, T, Query> {
    body: T;
}
