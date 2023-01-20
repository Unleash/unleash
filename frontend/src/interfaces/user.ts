export const AccountTypes = ['User', 'Service Account'] as const;
type AccountType = typeof AccountTypes[number];

export interface IUser {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    imageUrl: string;
    loginAttempts: number;
    permissions: string[] | null;
    inviteLink: string;
    rootRole: number;
    seenAt: string | null;
    username?: string;
    isAPI: boolean;
    paid?: boolean;
    addedAt?: string;
    accountType?: AccountType;
}

export interface IPermission {
    permission: string;
    project?: string;
    environment?: string;
}
