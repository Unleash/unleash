import { SYSTEM_USER } from '../../lib/types';
import type {
    IApiRequest,
    IApiUser,
    IAuthRequest,
    IAuditUser,
    IUser,
} from '../server-impl';

export function extractUsernameFromUser(user: IUser | IApiUser): string {
    return (user as IUser)?.email || user?.username || SYSTEM_USER.username;
}

export function extractUsername(req: IAuthRequest | IApiRequest): string {
    return extractUsernameFromUser(req.user);
}

export const extractUserIdFromUser = (user: IUser | IApiUser) =>
    (user as IUser)?.id ||
    (user as IApiUser)?.internalAdminTokenUserId ||
    SYSTEM_USER.id;

export const extractUserId = (req: IAuthRequest | IApiRequest) =>
    extractUserIdFromUser(req.user);

export const extractUserInfo = (req: IAuthRequest | IApiRequest) => ({
    id: extractUserId(req),
    username: extractUsername(req),
});

export const extractAuditInfo = (
    req: IAuthRequest | IApiRequest,
): IAuditUser => ({
    id: extractUserId(req),
    username: extractUsername(req),
    ip: req.ip,
});
