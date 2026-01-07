import type { IUnleashConfig } from '../types/option.js';
import type {
    IFavoriteProjectsStore,
    IUnleashStores,
} from '../types/stores.js';
import type { IFavoriteFeaturesStore } from '../types/stores/favorite-features.js';
import type { IFavoriteFeature, IFavoriteProject } from '../types/favorites.js';
import {
    FeatureFavoritedEvent,
    FeatureUnfavoritedEvent,
    type IAuditUser,
    ProjectFavoritedEvent,
    ProjectUnfavoritedEvent,
} from '../types/index.js';
import type { IUser } from '../types/user.js';
import type { IFavoriteProjectKey } from '../types/stores/favorite-projects.js';
import type EventService from '../features/events/event-service.js';
import { NotFoundError } from '../error/index.js';

export interface IFavoriteFeatureProps {
    feature: string;
    user: IUser;
}

export interface IFavoriteProjectProps {
    project: string;
    user: IUser;
}

export class FavoritesService {
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
        _config: IUnleashConfig,
        eventService: EventService,
    ) {
        this.favoriteFeaturesStore = favoriteFeaturesStore;
        this.favoriteProjectsStore = favoriteProjectsStore;
        this.eventService = eventService;
    }

    async favoriteFeature(
        { feature, user }: IFavoriteFeatureProps,
        auditUser: IAuditUser,
    ): Promise<IFavoriteFeature> {
        const data = await this.favoriteFeaturesStore.addFavoriteFeature({
            feature: feature,
            userId: user.id,
        });
        if (data === undefined) {
            throw new NotFoundError(
                `Feature with name ${feature} did not exist`,
            );
        }
        await this.eventService.storeEvent(
            new FeatureFavoritedEvent({
                featureName: feature,
                data: {
                    feature,
                },
                auditUser,
            }),
        );
        return data;
    }

    async unfavoriteFeature(
        { feature, user }: IFavoriteFeatureProps,
        auditUser: IAuditUser,
    ): Promise<void> {
        const data = await this.favoriteFeaturesStore.delete({
            feature: feature,
            userId: user.id,
        });
        await this.eventService.storeEvent(
            new FeatureUnfavoritedEvent({
                featureName: feature,
                data: {
                    feature,
                },
                auditUser,
            }),
        );
        return data;
    }

    async favoriteProject(
        { project, user }: IFavoriteProjectProps,
        auditUser: IAuditUser,
    ): Promise<IFavoriteProject> {
        const data = await this.favoriteProjectsStore.addFavoriteProject({
            project,
            userId: user.id,
        });
        if (data === undefined) {
            throw new NotFoundError(`Project with id ${project} was not found`);
        }
        await this.eventService.storeEvent(
            new ProjectFavoritedEvent({
                data: {
                    project,
                },
                project,
                auditUser,
            }),
        );
        return data;
    }

    async unfavoriteProject(
        { project, user }: IFavoriteProjectProps,
        auditUser: IAuditUser,
    ): Promise<void> {
        const _data = await this.favoriteProjectsStore.delete({
            project: project,
            userId: user.id,
        });
        await this.eventService.storeEvent(
            new ProjectUnfavoritedEvent({
                data: {
                    project,
                },
                project,
                auditUser,
            }),
        );
    }

    async isFavoriteProject(favorite: IFavoriteProjectKey): Promise<boolean> {
        if (favorite.userId) {
            return this.favoriteProjectsStore.exists(favorite);
        }
        return Promise.resolve(false);
    }
}
