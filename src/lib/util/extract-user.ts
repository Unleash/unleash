import { IAuthRequest, User } from '../server-impl';

export function extractUsernameFromUser(user: User): string {
    return user ? user.email || user.username : 'unknown';
}

export function extractUsername(req: IAuthRequest): string {
    return extractUsernameFromUser(req.user);
}
