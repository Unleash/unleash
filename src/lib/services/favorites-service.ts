import { IUnleashConfig } from '../types/option';
import { IFavoriteProjectsStore, IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IFavoriteFeaturesStore } from '../types/stores/favorite-features';
import { IFavoriteFeature, IFavoriteProject } from '../types/favorites';
import {
    FEATURE_FAVORITED,
    FEATURE_UNFAVORITED,
    PROJECT_FAVORITED,
    PROJECT_UNFAVORITED,
} from '../types';
import { IUser } from '../types/user';
import { extractUsernameFromUser } from '../util';
import { IFavoriteProjectKey } from '../types/stores/favorite-projects';
import EventService from '../features/events/event-service';

export interface IFavoriteFeatureProps {
    feature: string;
    user: IUser;
}

export interface IFavoriteProjectProps {
    project: string;
    user: IUser;
}

export class FavoritesService {
    private config: IUnleashConfig;

    private logger: Logger;

    private favoriteFeaturesStore: IFavoriteFeaturesStore;

    private favoriteProjectsStore: IFavoriteProjectsStore;

    private eventService: EventService;

    constructor(
        {
            favoriteFeaturesStore,
            favoriteProjectsStore,
        }: Pick<
            IUnleashStores,
            'favoriteFeaturesStore' | 'favoriteProjectsStore'
        >,
        config: IUnleashConfig,
        eventService: EventService,
    ) {
        this.config = config;
        this.logger = config.getLogger('services/favorites-service.ts');
        this.favoriteFeaturesStore = favoriteFeaturesStore;
        this.favoriteProjectsStore = favoriteProjectsStore;
        this.eventService = eventService;
    }

    async favoriteFeature({
        feature,
        user,
    }: IFavoriteFeatureProps): Promise<IFavoriteFeature> {
        const data = await this.favoriteFeaturesStore.addFavoriteFeature({
            feature: feature,
            userId: user.id,
        });
        await this.eventService.storeEvent({
            type: FEATURE_FAVORITED,
            featureName: feature,
            createdBy: extractUsernameFromUser(user),
            createdByUserId: user.id,
            data: {
                feature,
            },
        });
        return data;
    }

    async unfavoriteFeature({
        feature,
        user,
    }: IFavoriteFeatureProps): Promise<void> {
        const data = await this.favoriteFeaturesStore.delete({
            feature: feature,
            userId: user.id,
        });
        await this.eventService.storeEvent({
            type: FEATURE_UNFAVORITED,
            featureName: feature,
            createdBy: extractUsernameFromUser(user),
            createdByUserId: user.id,
            data: {
                feature,
            },
        });
        return data;
    }

    async favoriteProject({
        project,
        user,
    }: IFavoriteProjectProps): Promise<IFavoriteProject> {
        const data = this.favoriteProjectsStore.addFavoriteProject({
            project,
            userId: user.id,
        });
        await this.eventService.storeEvent({
            type: PROJECT_FAVORITED,
            createdBy: extractUsernameFromUser(user),
            createdByUserId: user.id,
            data: {
                project,
            },
        });
        return data;
    }

    async unfavoriteProject({
        project,
        user,
    }: IFavoriteProjectProps): Promise<void> {
        const data = this.favoriteProjectsStore.delete({
            project: project,
            userId: user.id,
        });
        await this.eventService.storeEvent({
            type: PROJECT_UNFAVORITED,
            createdBy: extractUsernameFromUser(user),
            createdByUserId: user.id,
            data: {
                project,
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
