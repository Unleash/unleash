import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import type { Logger } from '../logger.js';
import type { IProject, IProjectHealthReport } from '../types/model.js';
import type { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type.js';
import type { IProjectStore } from '../features/project/project-store-type.js';
import type ProjectService from '../features/project/project-service.js';
import { calculateProjectHealthRating } from '../domain/project-health/project-health.js';
import { batchExecute } from '../util/index.js';
import metricsHelper from '../util/metrics-helper.js';
import { FUNCTION_TIME } from '../metric-events.js';
import type { IProjectHealthFeaturesReadModel } from '../domain/project-health/features-read-model.js';

export default class ProjectHealthService {
    private logger: Logger;

    private projectStore: IProjectStore;

    private featureToggleStore: IFeatureToggleStore;

    private projectService: ProjectService;

    private featuresReadModel: IProjectHealthFeaturesReadModel;

    calculateHealthRating: (project: Pick<IProject, 'id'>) => Promise<number>;

    private timer: Function;

    constructor(
        {
            projectStore,
            featureToggleStore,
        }: Pick<IUnleashStores, 'projectStore' | 'featureToggleStore'>,
        { getLogger, eventBus }: Pick<IUnleashConfig, 'getLogger' | 'eventBus'>,
        projectService: ProjectService,
        featuresReadModel: IProjectHealthFeaturesReadModel,
    ) {
        this.logger = getLogger('services/project-health-service.ts');
        this.projectStore = projectStore;
        this.featureToggleStore = featureToggleStore;
        this.featuresReadModel = featuresReadModel;

        this.projectService = projectService;
        this.calculateHealthRating = calculateProjectHealthRating(
            this.featuresReadModel,
            this.featureToggleStore,
        );
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(eventBus, FUNCTION_TIME, {
                className: 'ProjectHealthService',
                functionName,
            });
    }

    async getProjectHealthReport(
        projectId: string,
    ): Promise<IProjectHealthReport> {
        const overview = await this.projectService.getProjectHealth(
            projectId,
            false,
            undefined,
        );

        const potentiallyStaleCount =
            await this.featuresReadModel.getPotentiallyStaleCount(projectId);

        return {
            ...overview,
            potentiallyStaleCount,
            activeCount: overview.features.filter((flag) => !flag.stale).length,
            staleCount: overview.features.filter((flag) => flag.stale).length,
        };
    }

    async setHealthRating(batchSize = 1): Promise<void> {
        const projects = await this.projectStore.getAll();

        void batchExecute(projects, batchSize, 5000, (project) =>
            this.setProjectHealthRating(project.id),
        );
    }

    async setProjectHealthRating(projectId: string): Promise<void> {
        const stopTimer = this.timer('setProjectHealthRating');
        const newHealth = await this.calculateHealthRating({ id: projectId });
        await this.projectStore.updateHealth({
            id: projectId,
            health: newHealth,
        });
        stopTimer();
    }
}
