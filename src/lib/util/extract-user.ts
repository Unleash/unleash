import { IApiRequest, IApiUser, IAuthRequest, IUser } from '../server-impl';

export function extractUsernameFromUser(user: IUser | IApiUser): string {
    return (user as IUser)?.email || user?.username || 'unknown';
}

export function extractUsername(req: IAuthRequest | IApiRequest): string {
    return extractUsernameFromUser(req.user);
}

export const extractUserId = (req: IAuthRequest | IApiRequest) =>
    (req.user as IUser).id || (req.user as IApiUser).internalAdminTokenUserId;

export const extractUserInfo = (req: IAuthRequest | IApiRequest) => ({
    id: extractUserId(req),
    username: extractUsername(req),
});
