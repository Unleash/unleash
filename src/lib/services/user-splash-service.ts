import type { Logger } from '../logger.js';
import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import type { IUser } from '../types/user.js';
import type {
    IUserSplash,
    IUserSplashStore,
} from '../types/stores/user-splash-store.js';

export default class UserSplashService {
    private userSplashStore: IUserSplashStore;

    private logger: Logger;

    constructor(
        { userSplashStore }: Pick<IUnleashStores, 'userSplashStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.userSplashStore = userSplashStore;
        this.logger = getLogger('services/user-splash-service.js');
    }

    async getAllUserSplashes(user: IUser): Promise<Record<string, boolean>> {
        if (user.isAPI) {
            return {};
        }
        try {
            return (
                await this.userSplashStore.getAllUserSplashes(user.id)
            ).reduce(
                (splashObject, splash) => ({
                    ...splashObject,
                    [splash.splashId]: splash.seen,
                }),
                {},
            );
        } catch (err) {
            this.logger.error(err);
            return {};
        }
    }

    async getSplash(user_id: number, splash_id: string): Promise<IUserSplash> {
        return this.userSplashStore.getSplash(user_id, splash_id);
    }

    async updateSplash(splash: IUserSplash): Promise<IUserSplash> {
        try {
            return await this.userSplashStore.updateSplash(splash);
        } catch (err) {
            this.logger.warn(err);
            return splash;
        }
    }
}
