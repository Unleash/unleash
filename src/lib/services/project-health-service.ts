import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import type { IProject, IProjectHealthReport } from '../types/model';
import type { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import type {
    IFeatureType,
    IFeatureTypeStore,
} from '../types/stores/feature-type-store';
import type { IProjectStore } from '../types/stores/project-store';
import ProjectService from './project-service';
import {
    calculateProjectHealth,
    calculateHealthRating,
} from '../domain/project-health/project-health';

export default class ProjectHealthService {
    private logger: Logger;

    private projectStore: IProjectStore;

    private featureTypeStore: IFeatureTypeStore;

    private featureToggleStore: IFeatureToggleStore;

    private featureTypes: IFeatureType[];

    private projectService: ProjectService;

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
        projectService: ProjectService,
    ) {
        this.logger = getLogger('services/project-health-service.ts');
        this.projectStore = projectStore;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTypes = [];

        this.projectService = projectService;
    }

    async getProjectHealthReport(
        projectId: string,
    ): Promise<IProjectHealthReport> {
        if (this.featureTypes.length === 0) {
            this.featureTypes = await this.featureTypeStore.getAll();
        }

        const overview = await this.projectService.getProjectOverview(
            projectId,
            false,
            undefined,
        );

        const healthRating = calculateProjectHealth(
            overview.features,
            this.featureTypes,
        );

        return {
            ...overview,
            ...healthRating,
        };
    }

    async calculateHealthRating(project: IProject): Promise<number> {
        if (this.featureTypes.length === 0) {
            this.featureTypes = await this.featureTypeStore.getAll();
        }

        const toggles = await this.featureToggleStore.getAll({
            project: project.id,
            archived: false,
        });

        return calculateHealthRating(toggles, this.featureTypes);
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
}
