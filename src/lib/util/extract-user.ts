import { IAuthRequest, IUser } from '../server-impl';

export function extractUsernameFromUser(user: IUser): string {
    return user ? user.email || user.username : 'unknown';
}

export function extractUsername(req: IAuthRequest): string {
    return extractUsernameFromUser(req.user);
}
