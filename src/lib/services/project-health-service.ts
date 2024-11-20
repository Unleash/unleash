import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { Logger } from '../logger';
import type { IProjectHealthReport } from '../types/model';
import type { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type';
import type { IFeatureTypeStore } from '../types/stores/feature-type-store';
import type { IProjectStore } from '../features/project/project-store-type';
import type ProjectService from '../features/project/project-service';
import {
    calculateProjectHealth,
    calculateProjectHealthRating,
} from '../domain/project-health/project-health';

export default class ProjectHealthService {
    private logger: Logger;

    private projectStore: IProjectStore;

    private featureTypeStore: IFeatureTypeStore;

    private featureToggleStore: IFeatureToggleStore;

    private projectService: ProjectService;

    calculateHealthRating: (projectId: string) => Promise<number>;

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

        this.projectService = projectService;
        this.calculateHealthRating = calculateProjectHealthRating(
            this.featureTypeStore,
            this.featureToggleStore,
        );
    }

    async getProjectHealthReport(
        projectId: string,
    ): Promise<IProjectHealthReport> {
        const featureTypes = await this.featureTypeStore.getAll();

        const overview = await this.projectService.getProjectHealth(
            projectId,
            false,
            undefined,
        );

        const healthRating = calculateProjectHealth(
            overview.features,
            featureTypes,
        );

        return {
            ...overview,
            ...healthRating,
        };
    }

    async setHealthRating(): Promise<void> {
        const projects = await this.projectStore.getAll();

        await Promise.all(
            projects.map(async (project) => {
                const newHealth = await this.calculateHealthRating(project.id);
                await this.projectStore.updateHealth({
                    id: project.id,
                    health: newHealth,
                });
            }),
        );
    }
}
