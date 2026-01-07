import type { IFavoriteProjectsStore } from '../../lib/types/index.js';
import type { IFavoriteProjectKey } from '../../lib/types/stores/favorite-projects.js';
import type { IFavoriteProject } from '../../lib/types/favorites.js';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakeFavoriteProjectsStore
    implements IFavoriteProjectsStore
{
    addFavoriteProject(
        _favorite: IFavoriteProjectKey,
    ): Promise<IFavoriteProject | undefined> {
        return Promise.resolve(undefined);
    }

    delete(_key: IFavoriteProjectKey): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    exists(_key: IFavoriteProjectKey): Promise<boolean> {
        return Promise.resolve(false);
    }

    get(_key: IFavoriteProjectKey): Promise<IFavoriteProject | undefined> {
        return Promise.resolve(undefined);
    }

    getAll(_query?: Object): Promise<IFavoriteProject[]> {
        return Promise.resolve([]);
    }
}
