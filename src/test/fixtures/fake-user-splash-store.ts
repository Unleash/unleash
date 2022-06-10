import {
    IUserSplashKey,
    IUserSplash,
    IUserSplashStore,
} from '../../lib/types/stores/user-splash-store';

export default class FakeUserSplashStore implements IUserSplashStore {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAllUserSplashes(userId: number): Promise<IUserSplash[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getSplash(userId: number, splashId: string): Promise<IUserSplash> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSplash(splash: IUserSplash): Promise<IUserSplash> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exists(key: IUserSplashKey): Promise<boolean> {
        return Promise.resolve(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(key: IUserSplashKey): Promise<IUserSplash> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAll(): Promise<IUserSplash[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete(key: IUserSplashKey): Promise<void> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    destroy(): void {}
}
