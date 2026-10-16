import type { Db, IUnleashConfig } from '../../types/index.js';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store.js';
import ProjectStatsStore from '../../db/project-stats-store.js';
import FakeProjectStore from '../../../test/fixtures/fake-project-store.js';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store.js';
import FakeProjectStatsStore from '../../../test/fixtures/fake-project-stats-store.js';
import { ProjectInsightsService } from './project-insights-service.js';
import ProjectStore from '../project/project-store.js';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store.js';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store.js';
import { ProjectHealthFeaturesReadModel } from '../../domain/project-health/features-read-model.js';
import { FakeProjectHealthFeaturesReadModel } from '../../domain/project-health/fake-features-read-model.js';

export const createProjectInsightsService = (
    db: Db,
    config: IUnleashConfig,
): ProjectInsightsService => {
    const { eventBus, getLogger, flagResolver } = config;
    const projectStore = new ProjectStore(db, eventBus, config);
    const featureToggleStore = new FeatureToggleStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );

    const projectStatsStore = new ProjectStatsStore(db, eventBus, getLogger);
    const featureStrategiesStore = new FeatureStrategiesStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const featuresReadModel = new ProjectHealthFeaturesReadModel(db);

    return new ProjectInsightsService(
        {
            projectStore,
            featureToggleStore,
            projectStatsStore,
            featureStrategiesStore,
        },
        featuresReadModel,
    );
};

export const createFakeProjectInsightsService = () => {
    const projectStore = new FakeProjectStore();
    const featureToggleStore = new FakeFeatureToggleStore();
    const projectStatsStore = new FakeProjectStatsStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const featuresReadModel = new FakeProjectHealthFeaturesReadModel();
    const projectInsightsService = new ProjectInsightsService(
        {
            projectStore,
            featureToggleStore,
            projectStatsStore,
            featureStrategiesStore,
        },
        featuresReadModel,
    );

    return {
        projectInsightsService,
        projectStatsStore,
        featureToggleStore,
        projectStore,
    };
};
