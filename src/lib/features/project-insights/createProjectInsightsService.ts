import type { Db, IUnleashConfig } from '../../server-impl';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store';
import ProjectStatsStore from '../../db/project-stats-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store';
import FakeProjectStatsStore from '../../../test/fixtures/fake-project-stats-store';
import FeatureTypeStore from '../../db/feature-type-store';
import FakeFeatureTypeStore from '../../../test/fixtures/fake-feature-type-store';
import { ProjectInsightsService } from './project-insights-service';
import ProjectStore from '../project/project-store';
import { ProjectInsightsReadModel } from './project-insights-read-model';
import { FakeProjectInsightsReadModel } from './fake-project-insights-read-model';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store';

export const createProjectInsightsService = (
    db: Db,
    config: IUnleashConfig,
): ProjectInsightsService => {
    const { eventBus, getLogger, flagResolver } = config;
    const projectStore = new ProjectStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const featureToggleStore = new FeatureToggleStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );

    const featureTypeStore = new FeatureTypeStore(db, getLogger);
    const projectStatsStore = new ProjectStatsStore(db, eventBus, getLogger);
    const featureStrategiesStore = new FeatureStrategiesStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const projectInsightsReadModel = new ProjectInsightsReadModel(db);

    return new ProjectInsightsService(
        {
            projectStore,
            featureToggleStore,
            featureTypeStore,
            projectStatsStore,
            featureStrategiesStore,
        },
        projectInsightsReadModel,
    );
};

export const createFakeProjectInsightsService = (
    config: IUnleashConfig,
): ProjectInsightsService => {
    const projectStore = new FakeProjectStore();
    const featureToggleStore = new FakeFeatureToggleStore();
    const featureTypeStore = new FakeFeatureTypeStore();
    const projectStatsStore = new FakeProjectStatsStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const projectInsightsReadModel = new FakeProjectInsightsReadModel();

    return new ProjectInsightsService(
        {
            projectStore,
            featureToggleStore,
            featureTypeStore,
            projectStatsStore,
            featureStrategiesStore,
        },
        projectInsightsReadModel,
    );
};
