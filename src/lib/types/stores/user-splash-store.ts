import { Store } from './store';

export interface IUserSplash {
    seen: boolean;
    splashId: string;
    userId: number;
}

export interface IUserSplashKey {
    userId: number;
    splashId: string;
}

export interface IUserSplashStore extends Store<IUserSplash, IUserSplashKey> {
    getAllUserSplashes(userId: number): Promise<IUserSplash[]>;
    getSplash(userId: number, splashId: string): Promise<IUserSplash>;
    updateSplash(splash: IUserSplash): Promise<IUserSplash>;
}
