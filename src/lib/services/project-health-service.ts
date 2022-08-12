import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import {
    FeatureToggle,
    IFeatureOverview,
    IProject,
    IProjectHealthReport,
    IProjectOverview,
} from '../types/model';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IFeatureTypeStore } from '../types/stores/feature-type-store';
import { IProjectStore } from '../types/stores/project-store';
import FeatureToggleService from './feature-toggle-service';
import { hoursToMilliseconds } from 'date-fns';
import Timer = NodeJS.Timer;

export default class ProjectHealthService {
    private logger: Logger;

    private projectStore: IProjectStore;

    private featureTypeStore: IFeatureTypeStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureTypes: Map<string, number>;

    private healthRatingTimer: Timer;

    private featureToggleService: FeatureToggleService;

    constructor(
        {
            projectStore,
            featureTypeStore,
            featureToggleStore,
        }: Pick<
            IUnleashStores,
            'projectStore' | 'featureTypeStore' | 'featureToggleStore'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        featureToggleService: FeatureToggleService,
    ) {
        this.logger = getLogger('services/project-health-service.ts');
        this.projectStore = projectStore;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTypes = new Map();
        this.healthRatingTimer = setInterval(
            () => this.setHealthRating(),
            hoursToMilliseconds(1),
        ).unref();
        this.featureToggleService = featureToggleService;
    }

    // TODO: duplicate from project-service.
    async getProjectOverview(
        projectId: string,
        archived: boolean = false,
    ): Promise<IProjectOverview> {
        const project = await this.projectStore.get(projectId);
        const environments = await this.projectStore.getEnvironmentsForProject(
            projectId,
        );
        const features = await this.featureToggleService.getFeatureOverview(
            projectId,
            archived,
        );
        const members = await this.projectStore.getMembersCountByProject(
            projectId,
        );
        return {
            name: project.name,
            description: project.description,
            health: project.health,
            updatedAt: project.updatedAt,
            environments,
            features,
            members,
            version: 1,
        };
    }

    async getProjectHealthReport(
        projectId: string,
    ): Promise<IProjectHealthReport> {
        const overview = await this.getProjectOverview(projectId, false);
        return {
            ...overview,
            potentiallyStaleCount: await this.potentiallyStaleCount(
                overview.features,
            ),
            activeCount: this.activeCount(overview.features),
            staleCount: this.staleCount(overview.features),
        };
    }

    private async potentiallyStaleCount(
        features: Pick<FeatureToggle, 'createdAt' | 'stale' | 'type'>[],
    ): Promise<number> {
        const today = new Date().valueOf();
        if (this.featureTypes.size === 0) {
            const types = await this.featureTypeStore.getAll();
            types.forEach((type) => {
                this.featureTypes.set(
                    type.name.toLowerCase(),
                    type.lifetimeDays,
                );
            });
        }
        return features.filter((feature) => {
            const diff = today - feature.createdAt.valueOf();
            const featureTypeExpectedLifetime = this.featureTypes.get(
                feature.type,
            );
            return (
                !feature.stale &&
                diff >= featureTypeExpectedLifetime * hoursToMilliseconds(24)
            );
        }).length;
    }

    private activeCount(features: IFeatureOverview[]): number {
        return features.filter((f) => !f.stale).length;
    }

    private staleCount(features: IFeatureOverview[]): number {
        return features.filter((f) => f.stale).length;
    }

    async calculateHealthRating(project: IProject): Promise<number> {
        const toggles = await this.featureToggleStore.getAll({
            project: project.id,
            archived: false,
        });

        const activeToggles = toggles.filter((feature) => !feature.stale);
        const staleToggles = toggles.length - activeToggles.length;
        const potentiallyStaleToggles = await this.potentiallyStaleCount(
            activeToggles,
        );
        return this.getHealthRating(
            toggles.length,
            staleToggles,
            potentiallyStaleToggles,
        );
    }

    private getHealthRating(
        toggleCount: number,
        staleToggleCount: number,
        potentiallyStaleCount: number,
    ): number {
        const startPercentage = 100;
        const stalePercentage = (staleToggleCount / toggleCount) * 100 || 0;
        const potentiallyStalePercentage =
            (potentiallyStaleCount / toggleCount) * 100 || 0;
        const rating = Math.round(
            startPercentage - stalePercentage - potentiallyStalePercentage,
        );
        return rating;
    }

    async setHealthRating(): Promise<void> {
        const projects = await this.projectStore.getAll();

        await Promise.all(
            projects.map(async (project) => {
                const newHealth = await this.calculateHealthRating(project);
                await this.projectStore.updateHealth({
                    id: project.id,
                    health: newHealth,
                });
            }),
        );
    }

    destroy(): void {
        clearInterval(this.healthRatingTimer);
    }
}
