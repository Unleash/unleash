import { expect, test, vi } from 'vitest';
import { createFakeFeatureToggleService } from '../createFeatureToggleService.js';
import { createTestConfig } from '../../../../test/config/test-config.js';
import { TEST_AUDIT_USER, type IVariant } from '../../../types/index.js';
import { DEFAULT_ENV } from '../../../util/constants.js';
import { EXCEEDS_LIMIT } from '../../../metric-events.js';

const context = {
    projectId: 'default',
    featureName: 'normalized-feature',
    environment: DEFAULT_ENV,
};

const variants = (): IVariant[] =>
    ['c', 'a', 'b'].map((name) => ({
        name,
        weight: 1,
        weightType: 'variable',
        stickiness: 'default',
    }));

test('strategy writes emit limit telemetry; standalone validation does not', async () => {
    const {
        featureToggleService,
        featureToggleStore,
        strategyValidationService,
        eventBus,
    } = createFakeFeatureToggleService(
        createTestConfig({ resourceLimits: { constraintValues: 1 } }),
    );
    await featureToggleStore.create(context.projectId, {
        name: context.featureName,
        createdByUserId: TEST_AUDIT_USER.id,
    });
    const onLimit = vi.fn();
    eventBus.on(EXCEEDS_LIMIT, onLimit);
    const config = {
        name: 'default',
        constraints: [
            {
                contextName: 'custom',
                operator: 'IN' as const,
                values: ['a', 'b'],
            },
        ],
    };
    await expect(strategyValidationService.normalize(config)).rejects.toThrow(
        'established limit of 1',
    );
    expect(onLimit).not.toHaveBeenCalled();
    await expect(
        featureToggleService.unprotectedCreateStrategy(
            config,
            context,
            TEST_AUDIT_USER,
        ),
    ).rejects.toThrow('established limit of 1');
    expect(onLimit).toHaveBeenCalledExactlyOnceWith({
        resource: 'constraint values',
        limit: 1,
    });
});

test('strategy creation and updates persist normalized constraints and variant weights', async () => {
    const { featureToggleService, featureToggleStore, featureStrategiesStore } =
        createFakeFeatureToggleService(createTestConfig());
    await featureToggleStore.create(context.projectId, {
        name: context.featureName,
        createdByUserId: TEST_AUDIT_USER.id,
    });

    const created = await featureToggleService.unprotectedCreateStrategy(
        {
            name: 'default',
            variants: variants(),
            constraints: [
                { contextName: 'custom', operator: 'NUM_EQ', value: '5' },
            ],
        },
        context,
        TEST_AUDIT_USER,
    );
    const expectedVariants = [
        { ...variants()[1], weight: 333 },
        { ...variants()[2], weight: 333 },
        { ...variants()[0], weight: 334 },
    ];
    expect(created.variants).toEqual(expectedVariants);
    expect(await featureStrategiesStore.get(created.id)).toMatchObject({
        parameters: {},
        constraints: [
            {
                contextName: 'custom',
                operator: 'NUM_EQ',
                value: '5',
                values: [],
            },
        ],
        variants: expectedVariants,
    });

    await featureToggleService.unprotectedUpdateStrategy(
        created.id,
        {
            name: 'default',
            variants: variants(),
            constraints: [
                {
                    contextName: 'custom',
                    operator: 'DATE_AFTER',
                    value: '2024-01-01T00:00:00Z',
                },
            ],
        },
        context,
        TEST_AUDIT_USER,
    );
    expect(await featureStrategiesStore.get(created.id)).toMatchObject({
        constraints: [{ operator: 'DATE_AFTER', values: [] }],
        variants: expectedVariants,
    });
});

test('rejected strategy updates preserve stored configuration', async () => {
    const { featureToggleService, featureToggleStore, featureStrategiesStore } =
        createFakeFeatureToggleService(createTestConfig());
    await featureToggleStore.create(context.projectId, {
        name: context.featureName,
        createdByUserId: TEST_AUDIT_USER.id,
    });
    const created = await featureToggleService.unprotectedCreateStrategy(
        { name: 'default', variants: variants() },
        context,
        TEST_AUDIT_USER,
    );
    const previous = structuredClone(
        await featureStrategiesStore.get(created.id),
    );
    await expect(
        featureToggleService.unprotectedUpdateStrategy(
            created.id,
            {
                name: 'default',
                variants: [
                    { ...variants()[0], payload: { type: 'json', value: '{' } },
                ],
            },
            context,
            TEST_AUDIT_USER,
        ),
    ).rejects.toThrow('valid json');
    expect(await featureStrategiesStore.get(created.id)).toEqual(previous);
});
