import type { Db, IUnleashConfig } from '../../server-impl';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store';
import ProjectStatsStore from '../../db/project-stats-store';
import {
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store';
import FakeProjectStatsStore from '../../../test/fixtures/fake-project-stats-store';
import FeatureTypeStore from '../../db/feature-type-store';
import FakeFeatureTypeStore from '../../../test/fixtures/fake-feature-type-store';
import { ProjectInsightsService } from './project-insights-service';
import ProjectStore from '../project/project-store';

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
    const featureToggleService = createFeatureToggleService(db, config);

    return new ProjectInsightsService(
        {
            projectStore,
            featureToggleStore,
            featureTypeStore,
            projectStatsStore,
        },
        featureToggleService,
    );
};

export const createFakeProjectInsightsService = (
    config: IUnleashConfig,
): ProjectInsightsService => {
    const projectStore = new FakeProjectStore();
    const featureToggleStore = new FakeFeatureToggleStore();
    const featureTypeStore = new FakeFeatureTypeStore();
    const projectStatsStore = new FakeProjectStatsStore();
    const featureToggleService = createFakeFeatureToggleService(config);

    return new ProjectInsightsService(
        {
            projectStore,
            featureToggleStore,
            featureTypeStore,
            projectStatsStore,
        },
        featureToggleService,
    );
};
