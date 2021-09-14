import { IAuthRequest } from '../server-impl';

export function extractUsername(req: IAuthRequest): string {
    return req.user ? req.user.email || req.user.username : 'unknown';
}
