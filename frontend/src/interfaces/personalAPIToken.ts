export interface IPersonalAPIToken {
    id: string;
    description: string;
    expiresAt: string;
    createdAt: string;
    seenAt: string;
}

export interface INewPersonalAPIToken extends IPersonalAPIToken {
    secret: string;
}
