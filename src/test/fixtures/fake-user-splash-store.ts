import NotImplementedError from '../../lib/error/not-implemented-error.js';
import type {
    IUserSplashKey,
    IUserSplash,
    IUserSplashStore,
} from '../../lib/types/stores/user-splash-store.js';

export default class FakeUserSplashStore implements IUserSplashStore {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAllUserSplashes(_userId: number): Promise<IUserSplash[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getSplash(_userId: number, _splashId: string): Promise<IUserSplash> {
        throw new NotImplementedError('This is not implemented yet');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSplash(_splash: IUserSplash): Promise<IUserSplash> {
        throw new NotImplementedError('This is not implemented yet');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exists(_key: IUserSplashKey): Promise<boolean> {
        return Promise.resolve(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(_key: IUserSplashKey): Promise<IUserSplash> {
        throw new NotImplementedError('This is not implemented yet');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAll(): Promise<IUserSplash[]> {
        return Promise.resolve([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete(_key: IUserSplashKey): Promise<void> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    destroy(): void {}
}
