import { createTestConfig } from '../../../test/config/test-config.js';
import { createFakeReleasePlanMilestoneStrategyService } from './createReleasePlanMilestoneStrategyService.js';
import { TEST_AUDIT_USER } from '../../types/core.js';
import { DEFAULT_ENV } from '../../util/constants.js';
import type { FakeReleasePlanMilestoneStrategyStore } from '../../../test/fixtures/fake-release-plan-milestone-strategy-store.js';
import { ReleasePlanMilestoneStrategyService } from './release-plan-milestone-strategy-service.js';
import { FakeChangeRequestAccessReadModel } from '../change-request-access-service/fake-change-request-access-read-model.js';
import {
    type FeatureToggleService,
    SKIP_CHANGE_REQUEST,
} from '../../server-impl.js';
import type FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store.js';

const defaultContext = {
    projectId: 'default',
    environment: DEFAULT_ENV,
    featureName: 'Demo',
};

let featureToggleService: FeatureToggleService;
let milestoneStrategyStore: FakeReleasePlanMilestoneStrategyStore;
let milestoneStrategyService: ReleasePlanMilestoneStrategyService;
let featureStrategiesStore: FakeFeatureStrategiesStore;

beforeAll(() => {
    const config = createTestConfig();
    const fakeService = createFakeReleasePlanMilestoneStrategyService(config);
    featureToggleService = fakeService.featureToggleService;
    featureStrategiesStore = fakeService.featureStrategiesStore;
    milestoneStrategyStore = fakeService.milestoneStrategyStore;
    milestoneStrategyService = fakeService.releasePlanMilestoneStrategyService;
});

test('also updates feature strategy when present', async () => {
    const milestoneStrategy = await milestoneStrategyStore.insert({
        milestoneId: 'milestone-1',
        strategyName: 'default',
        sortOrder: 0,
        parameters: {},
        constraints: [],
        variants: [],
    });

    await featureStrategiesStore.insertStrategy({
        id: milestoneStrategy.id,
        projectId: defaultContext.projectId,
        featureName: defaultContext.featureName,
        environment: defaultContext.environment,
        strategyName: milestoneStrategy.strategyName,
        parameters: milestoneStrategy.parameters!,
        constraints: milestoneStrategy.constraints!,
        variants: milestoneStrategy.variants!,
        sortOrder: milestoneStrategy.sortOrder,
        createdAt: new Date(),
    });

    await milestoneStrategyService.updateStrategy(
        milestoneStrategy.id,
        {
            title: 'updated-title',
            parameters: { rollout: '50' },
            constraints: [],
            variants: [],
        },
        defaultContext,
        TEST_AUDIT_USER,
    );

    const updatedFeatureStrategy = await featureStrategiesStore.get(
        milestoneStrategy.id,
    );
    expect(updatedFeatureStrategy).toEqual(
        expect.objectContaining({
            title: 'updated-title',
            parameters: expect.objectContaining({ rollout: '50' }),
        }),
    );
});

test('throws PermissionError when user cannot bypass change requests', async () => {
    const config = createTestConfig();
    const service = new ReleasePlanMilestoneStrategyService(
        { releasePlanMilestoneStrategyStore: milestoneStrategyStore },
        { featureToggleService },
        new FakeChangeRequestAccessReadModel(false),
        config,
    );

    await expect(
        service.updateStrategy(
            'some-id',
            {
                title: 'updated-title',
                parameters: { rollout: '50' },
                constraints: [],
                variants: [],
            },
            defaultContext,
            TEST_AUDIT_USER,
        ),
    ).rejects.toThrow(SKIP_CHANGE_REQUEST);
});
