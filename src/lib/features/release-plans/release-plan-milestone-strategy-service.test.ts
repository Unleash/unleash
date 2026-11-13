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
import { FakePayloadSchemaReadModel } from '../payload-schema/fake-payload-schema-read-model.js';
import { VariantPayloadValidator } from '../payload-schema/variant-payload-validator.js';

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
        name: 'default',
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
        strategyName: milestoneStrategy.name,
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
        new VariantPayloadValidator(new FakePayloadSchemaReadModel()),
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

const createServiceWithPayloadSchemas = () => {
    const payloadSchemaReadModel = new FakePayloadSchemaReadModel();
    const service = createFakeReleasePlanMilestoneStrategyService(
        createTestConfig({ experimental: { flags: { payloadSchemas: true } } }),
        { payloadSchemaReadModel },
    );
    return { ...service, payloadSchemaReadModel };
};

const insertInactiveMilestoneStrategy = (
    store: FakeReleasePlanMilestoneStrategyStore,
) =>
    store.insert({
        milestoneId: 'milestone-1',
        name: 'default',
        sortOrder: 0,
        parameters: {},
        constraints: [],
        variants: [],
    });

const jsonVariant = (value: string) => ({
    name: 'blue',
    weight: 1000,
    weightType: 'variable' as const,
    stickiness: 'default',
    payload: { type: 'json' as const, value },
});

test("a milestone strategy cannot be changed to a variant payload that breaks the flag's payload schema", async () => {
    const {
        milestoneStrategyStore,
        releasePlanMilestoneStrategyService,
        payloadSchemaReadModel,
    } = createServiceWithPayloadSchemas();
    payloadSchemaReadModel.setPayloadSchema(defaultContext.featureName, {
        type: 'object',
        properties: { color: { type: 'string' } },
    });
    const milestoneStrategy = await insertInactiveMilestoneStrategy(
        milestoneStrategyStore,
    );

    const update =
        releasePlanMilestoneStrategyService.unprotectedUpdateStrategy(
            milestoneStrategy.id,
            { variants: [jsonVariant('{"color":1}')] },
            defaultContext,
            TEST_AUDIT_USER,
        );

    await expect(update).rejects.toThrow(
        'does not match the payload schema of feature "Demo"',
    );
});
