import { createTestConfig } from '../../../test/config/test-config.js';
import { createFakeReleasePlanMilestoneStrategyService } from './createReleasePlanMilestoneStrategyService.js';
import { TEST_AUDIT_USER } from '../../types/core.js';
import type { IStrategyConfig } from '../../types/index.js';
import { DEFAULT_ENV } from '../../util/constants.js';
import type { FeatureToggleService } from '../feature-toggle/feature-toggle-service.js';
import type FakeProjectStore from '../../../test/fixtures/fake-project-store.js';
import type { FakeReleasePlanMilestoneStrategyStore } from '../../../test/fixtures/fake-release-plan-milestone-strategy-store.js';
import type { ReleasePlanMilestoneStrategyService } from './release-plan-milestone-strategy-service.js';

const defaultContext = {
    projectId: 'default',
    environment: DEFAULT_ENV,
    featureName: 'Demo',
};

let featureToggleService: FeatureToggleService;
let projectStore: FakeProjectStore;
let milestoneStrategyStore: FakeReleasePlanMilestoneStrategyStore;
let milestoneStrategyService: ReleasePlanMilestoneStrategyService;

beforeAll(() => {
    const config = createTestConfig();
    const fakeService = createFakeReleasePlanMilestoneStrategyService(config);
    featureToggleService = fakeService.featureToggleService;
    projectStore = fakeService.projectStore;
    milestoneStrategyStore = fakeService.milestoneStrategyStore;
    milestoneStrategyService = fakeService.releasePlanMilestoneStrategyService;
});

const createFeatureStrategy = async (milestoneStrategy) => {
    return await featureToggleService.createStrategy(
        {
            id: milestoneStrategy.id,
            name: milestoneStrategy.strategyName,
            ...milestoneStrategy,
        } as IStrategyConfig,
        defaultContext,
        TEST_AUDIT_USER,
    );
};

test('should also update feature strategy when present', async () => {
    await projectStore.create({
        id: defaultContext.projectId,
        name: 'Default',
    });

    await featureToggleService.createFeatureToggle(
        defaultContext.projectId,
        { name: defaultContext.featureName },
        TEST_AUDIT_USER,
    );

    const milestoneStrategy = await milestoneStrategyStore.insert({
        milestoneId: 'milestone-1',
        strategyName: 'default',
        sortOrder: 0,
        parameters: {},
        constraints: [],
        variants: [],
    });

    const featureStrategy = await createFeatureStrategy(milestoneStrategy);

    await milestoneStrategyService.updateStrategy(
        featureStrategy.id,
        {
            title: 'updated-title',
            parameters: { rollout: '50' },
            constraints: [],
            variants: [],
        },
        defaultContext,
        TEST_AUDIT_USER,
    );

    const updatedFeatureStrategy = await featureToggleService.getStrategy(
        featureStrategy.id,
    );
    expect(updatedFeatureStrategy).toEqual(
        expect.objectContaining({
            title: 'updated-title',
            parameters: expect.objectContaining({ rollout: '50' }),
        }),
    );
});
