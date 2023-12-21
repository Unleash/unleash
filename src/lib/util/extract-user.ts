import { IAuthRequest, IUser } from '../server-impl';

export function extractUsernameFromUser(user: IUser): string {
    return user?.email || user?.username || 'unknown';
}

export function extractUsername(req: IAuthRequest): string {
    return extractUsernameFromUser(req.user);
}

export const extractUserId = (req: IAuthRequest) => req.user.id;

export const extractUserInfo = (req: IAuthRequest) => ({
    id: extractUserId(req),
    username: extractUsername(req),
});
