import { IUnleashConfig } from '../types/option';
import {
    IEventStore,
    IFavoriteProjectsStore,
    IUnleashStores,
} from '../types/stores';
import { Logger } from '../logger';
import { IFavoriteFeaturesStore } from '../types/stores/favorite-features';
import { IFavoriteFeature, IFavoriteProject } from '../types/favorites';
import {
    FAVORITE_FEATURE_ADDED,
    FAVORITE_FEATURE_REMOVED,
    FAVORITE_PROJECT_ADDED,
    FAVORITE_PROJECT_REMOVED,
} from '../types';
import User from '../types/user';
import { extractUsernameFromUser } from '../util';
import { IFavoriteProjectKey } from '../types/stores/favorite-projects';

export interface IFavoriteFeatureProps {
    feature: string;
    user: User;
}

export interface IFavoriteProjectProps {
    project: string;
    user: User;
}

export class FavoritesService {
    private config: IUnleashConfig;

    private logger: Logger;

    private favoriteFeaturesStore: IFavoriteFeaturesStore;

    private favoriteProjectsStore: IFavoriteProjectsStore;

    private eventStore: IEventStore;

    constructor(
        {
            favoriteFeaturesStore,
            favoriteProjectsStore,
            eventStore,
        }: Pick<
            IUnleashStores,
            'favoriteFeaturesStore' | 'favoriteProjectsStore' | 'eventStore'
        >,
        config: IUnleashConfig,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/favorites-service.ts');
        this.favoriteFeaturesStore = favoriteFeaturesStore;
        this.favoriteProjectsStore = favoriteProjectsStore;
        this.eventStore = eventStore;
    }

    async addFavoriteFeature({
        feature,
        user,
    }: IFavoriteFeatureProps): Promise<IFavoriteFeature> {
        const data = await this.favoriteFeaturesStore.addFavoriteFeature({
            feature: feature,
            userId: user.id,
        });
        await this.eventStore.store({
            type: FAVORITE_FEATURE_ADDED,
            createdBy: extractUsernameFromUser(user),
            data: {
                feature: feature,
            },
        });
        return data;
    }

    async removeFavoriteFeature({
        feature,
        user,
    }: IFavoriteFeatureProps): Promise<void> {
        const data = await this.favoriteFeaturesStore.delete({
            feature: feature,
            userId: user.id,
        });
        await this.eventStore.store({
            type: FAVORITE_FEATURE_REMOVED,
            createdBy: extractUsernameFromUser(user),
            data: {
                feature: feature,
            },
        });
        return data;
    }

    async addFavoriteProject({
        project,
        user,
    }: IFavoriteProjectProps): Promise<IFavoriteProject> {
        const data = this.favoriteProjectsStore.addFavoriteProject({
            project,
            userId: user.id,
        });
        await this.eventStore.store({
            type: FAVORITE_PROJECT_ADDED,
            createdBy: extractUsernameFromUser(user),
            data: {
                project: project,
            },
        });
        return data;
    }

    async removeFavoriteProject({
        project,
        user,
    }: IFavoriteProjectProps): Promise<void> {
        const data = this.favoriteProjectsStore.delete({
            project: project,
            userId: user.id,
        });
        await this.eventStore.store({
            type: FAVORITE_PROJECT_REMOVED,
            createdBy: extractUsernameFromUser(user),
            data: {
                project: project,
            },
        });
        return data;
    }

    async isFavoriteProject(favorite: IFavoriteProjectKey): Promise<boolean> {
        if (favorite.userId) {
            return this.favoriteProjectsStore.exists(favorite);
        }
        return Promise.resolve(false);
    }
}
