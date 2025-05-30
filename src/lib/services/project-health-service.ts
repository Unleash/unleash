import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import type { Logger } from '../logger.js';
import type { IProject } from '../types/model.js';
import type { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type.js';
import type { IFeatureTypeStore } from '../types/stores/feature-type-store.js';
import type { IProjectStore } from '../features/project/project-store-type.js';
import { calculateProjectHealthRating } from '../domain/project-health/project-health.js';
import { batchExecute } from '../util/index.js';
import metricsHelper from '../util/metrics-helper.js';
import { FUNCTION_TIME } from '../metric-events.js';

export default class ProjectHealthService {
    private logger: Logger;

    private projectStore: IProjectStore;

    private featureTypeStore: IFeatureTypeStore;

    private featureToggleStore: IFeatureToggleStore;

    calculateHealthRating: (project: Pick<IProject, 'id'>) => Promise<number>;

    private timer: Function;

    constructor(
        {
            projectStore,
            featureTypeStore,
            featureToggleStore,
        }: Pick<
            IUnleashStores,
            'projectStore' | 'featureTypeStore' | 'featureToggleStore'
        >,
        { getLogger, eventBus }: Pick<IUnleashConfig, 'getLogger' | 'eventBus'>,
    ) {
        this.logger = getLogger('services/project-health-service.ts');
        this.projectStore = projectStore;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleStore = featureToggleStore;

        this.calculateHealthRating = calculateProjectHealthRating(
            this.featureTypeStore,
            this.featureToggleStore,
        );
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(eventBus, FUNCTION_TIME, {
                className: 'ProjectHealthService',
                functionName,
            });
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
