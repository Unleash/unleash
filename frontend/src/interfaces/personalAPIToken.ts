export interface IPersonalAPIToken {
    id: string;
    description: string;
    expiresAt: string;
    expiryWarning?: 'expires-soon' | 'expired';
    createdAt: string;
    seenAt: string;
}

export interface INewPersonalAPIToken extends IPersonalAPIToken {
    secret: string;
}
