export interface IPersonalAPIToken {
    id: string;
    description: string;
    expiresAt: string;
    createdAt: string;
}

export interface INewPersonalAPIToken extends IPersonalAPIToken {
    secret: string;
}
