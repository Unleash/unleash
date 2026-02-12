import type { IUnleashConfig } from '../../types/index.js';
import type { Db } from '../../db/db.js';
import { ReleasePlanMilestoneStrategyService } from './release-plan-milestone-strategy-service.js';
import { ReleasePlanMilestoneStrategyStore } from './release-plan-milestone-strategy-store.js';
import {
    createFeatureToggleService,
    createFakeFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService.js';
import { FakeReleasePlanMilestoneStrategyStore } from '../../../test/fixtures/fake-release-plan-milestone-strategy-store.js';

export const createReleasePlanMilestoneStrategyService = (
    db: Db,
    config: IUnleashConfig,
): ReleasePlanMilestoneStrategyService => {
    const milestoneStrategyStore = new ReleasePlanMilestoneStrategyStore(db, {
        eventBus: config.eventBus,
    });
    const featureToggleService = createFeatureToggleService(db, config);

    return new ReleasePlanMilestoneStrategyService(
        { milestoneStrategyStore },
        { featureToggleService },
        config,
    );
};

export const createFakeReleasePlanMilestoneStrategyService = (
    config: IUnleashConfig,
) => {
    const milestoneStrategyStore = new FakeReleasePlanMilestoneStrategyStore();
    const { featureToggleService } = createFakeFeatureToggleService(config);

    const releasePlanMilestoneStrategyService =
        new ReleasePlanMilestoneStrategyService(
            { milestoneStrategyStore },
            { featureToggleService },
            config,
        );

    return {
        milestoneStrategyStore,
        featureToggleService,
        releasePlanMilestoneStrategyService,
    };
};
