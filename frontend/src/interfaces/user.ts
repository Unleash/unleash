export interface IAuthStatus {
    authDetails: IAuthDetails;
    showDialog: boolean;
    profile?: IUser;
    permissions: IPermission[];
    splash: ISplash;
}

export interface ISplash {
    [key: string]: boolean;
}

export interface IPermission {
    permission: string;
    project: string;
    displayName: string;
}

interface IAuthDetails {
    type: string;
    path: string;
    message: string;
    options: IAuthOptions[];
}

export interface IAuthOptions {
    type: string;
    message: string;
    path: string;
}

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

export interface IUserPayload {
    name: string;
    email: string;
    id?: string;
}

export interface IAddedUser extends IUser {
    emailSent?: boolean;
}

export default IAuthStatus;
