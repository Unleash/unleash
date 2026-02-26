import type { IUnleashConfig } from '../../types/index.js';
import type { Db } from '../../db/db.js';
import { ReleasePlanMilestoneStrategyService } from './release-plan-milestone-strategy-service.js';
import { ReleasePlanMilestoneStrategyStore } from './release-plan-milestone-strategy-store.js';
import {
    createFeatureToggleService,
    createFakeFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService.js';
import { FakeReleasePlanMilestoneStrategyStore } from '../../../test/fixtures/fake-release-plan-milestone-strategy-store.js';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel.js';

export const createReleasePlanMilestoneStrategyService = (
    db: Db,
    config: IUnleashConfig,
): ReleasePlanMilestoneStrategyService => {
    const releasePlanMilestoneStrategyStore =
        new ReleasePlanMilestoneStrategyStore(db, {
            eventBus: config.eventBus,
        });
    const featureToggleService = createFeatureToggleService(db, config);
    const changeRequestAccessReadModel = createChangeRequestAccessReadModel(
        db,
        config,
    );

    return new ReleasePlanMilestoneStrategyService(
        { releasePlanMilestoneStrategyStore },
        { featureToggleService },
        changeRequestAccessReadModel,
        config,
    );
};

export const createFakeReleasePlanMilestoneStrategyService = (
    config: IUnleashConfig,
) => {
    const milestoneStrategyStore = new FakeReleasePlanMilestoneStrategyStore();
    const { featureToggleService, featureStrategiesStore } =
        createFakeFeatureToggleService(config);

    const changeRequestAccessReadModel = createFakeChangeRequestAccessService();
    const releasePlanMilestoneStrategyService =
        new ReleasePlanMilestoneStrategyService(
            { releasePlanMilestoneStrategyStore: milestoneStrategyStore },
            { featureToggleService },
            changeRequestAccessReadModel,
            config,
        );

    return {
        milestoneStrategyStore,
        featureStrategiesStore,
        featureToggleService,
        releasePlanMilestoneStrategyService,
    };
};
