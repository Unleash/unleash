import { Request } from 'express';
import User from '../types/user';

export interface IAuthRequest extends Request {
    user: User;
    logout: () => void;
    session: any;
}
