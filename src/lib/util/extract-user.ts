import { SYSTEM_USER } from '../../lib/types';
import { IAuthRequest, IUser } from '../server-impl';

export function extractUsernameFromUser(user: IUser): string {
    return user?.email || user?.username || SYSTEM_USER.username;
}

export function extractUsername(req: IAuthRequest): string {
    return extractUsernameFromUser(req.user);
}

export const extractUserIdFromUser = (user: IUser) =>
    user?.id || SYSTEM_USER.id;

export const extractUserId = (req: IAuthRequest) =>
    extractUserIdFromUser(req.user);

export const extractUserInfo = (req: IAuthRequest) => ({
    id: extractUserId(req),
    username: extractUsername(req),
});
