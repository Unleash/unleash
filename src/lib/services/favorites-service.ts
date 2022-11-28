import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import {
    IFavoriteFeatureKey,
    IFavoriteFeaturesStore,
} from '../types/stores/favorite-features';
import { IFavoriteFeature } from '../types/favorites';

export class FavoritesService {
    private config: IUnleashConfig;

    private logger: Logger;

    private favoriteFeaturesStore: IFavoriteFeaturesStore;

    constructor(
        {
            favoriteFeaturesStore,
        }: Pick<IUnleashStores, 'favoriteFeaturesStore'>,
        config: IUnleashConfig,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/favorites-service.ts');
        this.favoriteFeaturesStore = favoriteFeaturesStore;
    }

    async addFavoriteFeature(
        favorite: IFavoriteFeatureKey,
    ): Promise<IFavoriteFeature> {
        return this.favoriteFeaturesStore.addFavoriteFeature(favorite);
    }

    async removeFavoriteFeature(favorite: IFavoriteFeatureKey): Promise<void> {
        return this.favoriteFeaturesStore.delete(favorite);
    }
}
