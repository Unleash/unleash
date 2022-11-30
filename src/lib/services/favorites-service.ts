import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import {
    IFavoriteFeatureKey,
    IFavoriteFeaturesStore,
} from '../types/stores/favorite-features';
import { IFavoriteFeature, IFavoriteProject } from '../types/favorites';
import {
    IFavoriteProjectKey,
    IFavoriteProjectsStore,
} from '../types/stores/favorite-projects';

export class FavoritesService {
    private config: IUnleashConfig;

    private logger: Logger;

    private favoriteFeaturesStore: IFavoriteFeaturesStore;

    private favoriteProjectsStore: IFavoriteProjectsStore;

    constructor(
        {
            favoriteFeaturesStore,
            favoriteProjectsStore,
        }: Pick<
            IUnleashStores,
            'favoriteFeaturesStore' | 'favoriteProjectsStore'
        >,
        config: IUnleashConfig,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/favorites-service.ts');
        this.favoriteFeaturesStore = favoriteFeaturesStore;
        this.favoriteProjectsStore = favoriteProjectsStore;
    }

    async addFavoriteFeature(
        favorite: IFavoriteFeatureKey,
    ): Promise<IFavoriteFeature> {
        return this.favoriteFeaturesStore.addFavoriteFeature(favorite);
    }

    async removeFavoriteFeature(favorite: IFavoriteFeatureKey): Promise<void> {
        return this.favoriteFeaturesStore.delete(favorite);
    }

    async addFavoriteProject(
        favorite: IFavoriteProjectKey,
    ): Promise<IFavoriteProject> {
        return this.favoriteProjectsStore.addFavoriteProject(favorite);
    }

    async removeFavoriteProject(favorite: IFavoriteProjectKey): Promise<void> {
        return this.favoriteProjectsStore.delete(favorite);
    }

    async isFavoriteProject(
        projectId: string,
        userId?: number,
    ): Promise<boolean> {
        if (userId) {
            return this.favoriteProjectsStore.exists({
                project: projectId,
                userId,
            });
        }
        return Promise.resolve(false);
    }
}
