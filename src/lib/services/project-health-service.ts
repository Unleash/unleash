import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import ProjectStore from '../db/project-store';
import { Logger } from '../logger';
import {
    IFeatureOverview,
    IProjectHealthReport,
    IProjectOverview,
} from '../types/model';
import { MILLISECONDS_IN_DAY } from '../util/constants';
import FeatureTypeStore from '../db/feature-type-store';

export default class ProjectHealthService {
    private logger: Logger;

    private projectStore: ProjectStore;

    private featureTypeStore: FeatureTypeStore;

    constructor(
        {
            projectStore,
            featureTypeStore,
        }: Pick<IUnleashStores, 'projectStore' | 'featureTypeStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/project-health-service.ts');
        this.projectStore = projectStore;
        this.featureTypeStore = featureTypeStore;
    }

    async getProjectOverview(
        projectId: string,
        archived: boolean = false,
    ): Promise<IProjectOverview> {
        const project = await this.projectStore.get(projectId);
        const features = await this.projectStore.getProjectOverview(
            projectId,
            archived,
        );
        const members = await this.projectStore.getMembers(projectId);
        return {
            name: project.name,
            description: project.description,
            health: project.health,
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
        features: IFeatureOverview[],
    ): Promise<number> {
        const today = new Date().valueOf();
        const featureTypes = await this.featureTypeStore.getAll();
        const featureTypeMap = featureTypes.reduce((acc, current) => {
            acc[current.id] = current.lifetimeDays;

            return acc;
        }, {});

        return features.filter(feature => {
            const diff = today - feature.createdAt.valueOf();
            return (
                !feature.stale &&
                diff > featureTypeMap[feature.type] * MILLISECONDS_IN_DAY
            );
        }).length;
    }

    private activeCount(features: IFeatureOverview[]): number {
        return features.filter(f => !f.stale).length;
    }

    private staleCount(features: IFeatureOverview[]): number {
        return features.filter(f => f.stale).length;
    }
}
