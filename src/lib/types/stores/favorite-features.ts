import type { IFavoriteFeature } from '../favorites.js';
import type { Store } from './store.js';

export interface IFavoriteFeatureKey {
    userId: number;
    feature: string;
}

export interface IFavoriteFeaturesStore
    extends Store<IFavoriteFeature, IFavoriteFeatureKey> {
    addFavoriteFeature(
        favorite: IFavoriteFeatureKey,
    ): Promise<IFavoriteFeature | undefined>;
}
