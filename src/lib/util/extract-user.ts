import { SYSTEM_USER, SYSTEM_USER_AUDIT } from '../../lib/types/index.js';
import type { IApiUser, IAuditUser, IUser } from '../types/index.js';
import type { IApiRequest, IAuthRequest } from '../routes/unleash-types.js';

type AnyAuthRequest = IAuthRequest<any, any, any, any>;
type AnyApiRequest = IApiRequest<any, any, any, any>;
type AnyRequest = AnyAuthRequest | AnyApiRequest;

export function extractUsernameFromUser(user: IUser | IApiUser): string {
    return (
        (user as IUser)?.email || user?.username || SYSTEM_USER_AUDIT.username
    );
}

export function extractUsername(req: AnyRequest): string {
    return extractUsernameFromUser(req.user);
}

export const extractUserIdFromUser = (user: IUser | IApiUser) =>
    (user as IUser)?.id ||
    (user as IApiUser)?.internalAdminTokenUserId ||
    SYSTEM_USER.id;

export const extractUserId = (req: AnyRequest) =>
    extractUserIdFromUser(req.user);

export const extractUserInfo = (req: AnyRequest) => ({
    id: extractUserId(req),
    username: extractUsername(req),
});

export const extractAuditInfoFromUser = (
    user: IUser | IApiUser,
    ip: string = '127.0.0.1',
): IAuditUser => ({
    id: extractUserIdFromUser(user),
    username: extractUsernameFromUser(user),
    ip,
});
export const extractAuditInfo = (req: AnyRequest): IAuditUser => ({
    id: extractUserId(req),
    username: extractUsername(req),
    ip: req.ip,
});
