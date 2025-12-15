import type { IFavoriteFeaturesStore } from '../../lib/types/index.js';
import type { IFavoriteFeatureKey } from '../../lib/types/stores/favorite-features.js';
import type { IFavoriteFeature } from '../../lib/types/favorites.js';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakeFavoriteFeaturesStore
    implements IFavoriteFeaturesStore
{
    addFavoriteFeature(
        _favorite: IFavoriteFeatureKey,
    ): Promise<IFavoriteFeature | undefined> {
        return Promise.resolve(undefined);
    }

    delete(_key: IFavoriteFeatureKey): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    exists(_key: IFavoriteFeatureKey): Promise<boolean> {
        return Promise.resolve(false);
    }

    get(_key: IFavoriteFeatureKey): Promise<IFavoriteFeature | undefined> {
        return Promise.resolve(undefined);
    }

    getAll(_query?: Object): Promise<IFavoriteFeature[]> {
        return Promise.resolve([]);
    }
}
