import { Request } from 'express';
import * as core from 'express-serve-static-core';
import User from '../types/user';

export interface IAuthRequest<
    PARAM = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query,
> extends Request<PARAM, ResBody, ReqBody, ReqQuery> {
    user: User;
    logout: () => void;
    session: any;
}
