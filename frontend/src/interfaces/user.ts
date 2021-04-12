interface IUser {
    authDetails: IAuthDetails;
    showDialog: boolean;
    profile?: IProfile;
}

interface IAuthDetails {
    type: string;
    path: string;
    message: string;
    options: string[];
}

interface IProfile {
    id: number;
    createdAt: string;
    imageUrl: string;
    loginAttempts: number;
    permissions: string[];
    seenAt: string;
    username: string;
}

export default IUser;
