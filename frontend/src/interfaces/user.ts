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
}

export interface IPermission {
    permission: string;
    project?: string;
    environment?: string;
}
