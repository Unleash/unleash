import { IFavoriteFeaturesStore } from '../../lib/types';
import { IFavoriteFeatureKey } from '../../lib/types/stores/favorite-features';
import { IFavoriteFeature } from '../../lib/types/favorites';
/* eslint-disable @typescript-eslint/no-unused-vars */
export default class FakeFavoriteFeaturesStore
    implements IFavoriteFeaturesStore
{
    addFavoriteFeature(
        favorite: IFavoriteFeatureKey,
    ): Promise<IFavoriteFeature> {
        return Promise.resolve(undefined);
    }

    delete(key: IFavoriteFeatureKey): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    exists(key: IFavoriteFeatureKey): Promise<boolean> {
        return Promise.resolve(false);
    }

    get(key: IFavoriteFeatureKey): Promise<IFavoriteFeature> {
        return Promise.resolve(undefined);
    }

    getAll(query?: Object): Promise<IFavoriteFeature[]> {
        return Promise.resolve([]);
    }
}
