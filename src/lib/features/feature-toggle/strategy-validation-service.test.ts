import { describe, expect, test, vi } from 'vitest';
import {
    StrategyValidationService,
    StrategyValidationLimitError,
} from './strategy-validation-service.js';
import FakeStrategiesStore from '../../../test/fixtures/fake-strategies-store.js';
import FakeContextFieldStore from '../context/fake-context-field-store.js';
import { ConstraintValidator } from '../constraints/constraint-validator.js';
import { ResourceLimitsService } from '../resource-limits/resource-limits-service.js';
import { createFakeSegmentService } from '../segment/createSegmentService.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import type { IConstraint, IVariant } from '../../types/index.js';
import type { ResourceLimitsSchema } from '../../openapi/index.js';

const destination = { projectId: 'default', featureName: 'my-feature' };
const variant = (name: string, weight = 1): IVariant => ({
    name,
    weight,
    weightType: 'variable',
    stickiness: 'default',
});

const createService = async (limits: Partial<ResourceLimitsSchema> = {}) => {
    const config = createTestConfig({ resourceLimits: limits });
    const strategyStore = new FakeStrategiesStore();
    await strategyStore.createStrategy({
        name: 'flexibleRollout',
        parameters: [],
    });
    const contextFieldStore = new FakeContextFieldStore();
    const segmentService = createFakeSegmentService(config);
    const getDefaultStickiness = vi.fn(async () => 'accountId');
    const service = new StrategyValidationService({
        strategyStore,
        constraintValidator: new ConstraintValidator(contextFieldStore),
        resourceLimitsService: new ResourceLimitsService(config),
        segmentService,
        featureStrategiesStore: { getDefaultStickiness },
    });
    return {
        service,
        config,
        contextFieldStore,
        segmentService,
        getDefaultStickiness,
    };
};

test('validates strategy types without requiring a destination', async () => {
    const { service } = await createService();
    await expect(service.normalize({ name: 'missing' })).rejects.toThrow(
        'Could not find strategy type with name missing',
    );
    await expect(service.normalize({ name: 'default' })).resolves.toMatchObject(
        { name: 'default' },
    );
});

test('template validation preserves placeholders and leaves destination defaults unresolved', async () => {
    const { service, getDefaultStickiness } = await createService();
    const parameters = { groupId: '{{featureName}}-rollout' };
    const normalized = await service.normalize({
        name: 'flexibleRollout',
        parameters,
    });
    expect(normalized.parameters).toEqual(parameters);
    expect(getDefaultStickiness).not.toHaveBeenCalled();
    expect(
        (await service.normalize({ name: 'flexibleRollout' })).parameters,
    ).toBeUndefined();
});

test('destination defaults match ordinary flexible-rollout behavior', async () => {
    const { service, getDefaultStickiness } = await createService();
    const normalized = await service.normalize(
        {
            name: 'flexibleRollout',
            parameters: { rollout: '0', stickiness: '', groupId: '' },
        },
        { destination },
    );
    expect(normalized.parameters).toEqual({
        rollout: '0',
        stickiness: 'accountId',
        groupId: 'my-feature',
    });
    expect(getDefaultStickiness).toHaveBeenCalledWith('default');
    expect(
        (await service.normalize({ name: 'flexibleRollout' }, { destination }))
            .parameters?.rollout,
    ).toBe('100');
});

test('preserves supplied parameters and does not invent custom strategy defaults', async () => {
    const { service, getDefaultStickiness } = await createService();
    const parameters = {
        rollout: 'not-validated-before',
        stickiness: 'custom',
        groupId: 'explicit',
    };
    expect(
        (
            await service.normalize(
                { name: 'flexibleRollout', parameters },
                { destination },
            )
        ).parameters,
    ).toEqual(parameters);
    expect(getDefaultStickiness).not.toHaveBeenCalled();
    expect(
        (await service.normalize({ name: 'default' }, { destination }))
            .parameters,
    ).toEqual({});
});

describe('constraint semantics', () => {
    test.each<{
        operator: IConstraint['operator'];
        valid: Partial<IConstraint>;
        invalid: Partial<IConstraint>;
    }>([
        {
            operator: 'NUM_EQ',
            valid: { value: '5' },
            invalid: { value: 'abc' },
        },
        {
            operator: 'DATE_AFTER',
            valid: { value: '2024-01-01T00:00:00Z' },
            invalid: { value: 'yesterday-ish' },
        },
        {
            operator: 'SEMVER_EQ',
            valid: { value: '1.2.3' },
            invalid: { value: '1.2' },
        },
        {
            operator: 'REGEX',
            valid: { value: '^hello$' },
            invalid: { value: '(' },
        },
        {
            operator: 'IN_CIDR',
            valid: { values: ['192.168.0.0/24'] },
            invalid: { values: ['not-a-network'] },
        },
    ])('validates $operator with and without a destination', async ({
        operator,
        valid,
        invalid,
    }) => {
        const { service } = await createService();
        for (const options of [{}, { destination }]) {
            const constraint = { contextName: 'custom', operator, ...valid };
            const normalized = await service.normalize(
                { name: 'default', constraints: [constraint] },
                options,
            );
            expect(normalized.constraints?.[0]).toMatchObject({
                ...constraint,
                values: constraint.values ?? [],
            });
            await expect(
                service.normalize(
                    {
                        name: 'default',
                        constraints: [
                            { contextName: 'custom', operator, ...invalid },
                        ],
                    },
                    options,
                ),
            ).rejects.toThrow();
        }
    });

    test('enforces context legal values', async () => {
        const { service, contextFieldStore } = await createService();
        await contextFieldStore.create({
            name: 'region',
            legalValues: [{ value: 'eu' }],
        });
        await expect(
            service.normalize({
                name: 'default',
                constraints: [
                    { contextName: 'region', operator: 'IN', values: ['us'] },
                ],
            }),
        ).rejects.toThrow('legal value');
        await expect(
            service.normalize({
                name: 'default',
                constraints: [
                    { contextName: 'region', operator: 'IN', values: ['eu'] },
                ],
            }),
        ).resolves.toMatchObject({ constraints: [{ values: ['eu'] }] });
    });
});

describe('variants', () => {
    test.each([
        { fixedWeight: 99, weights: [300, 300, 301] },
        { fixedWeight: 100, weights: [300, 300, 300] },
        { fixedWeight: 101, weights: [299, 300, 300] },
    ])('allocates remainder to the final variable names regardless of input order (fixed weight $fixedWeight)', async ({
        fixedWeight,
        weights,
    }) => {
        const { service } = await createService();
        const fixed: IVariant = {
            ...variant('fixed', fixedWeight),
            weightType: 'fix',
        };

        for (const order of ['abc', 'acb', 'bac', 'bca', 'cab', 'cba']) {
            const normalized = await service.normalize({
                name: 'default',
                variants: [
                    fixed,
                    ...order.split('').map((name) => variant(name)),
                ],
            });

            expect(normalized.variants).toEqual([
                { ...variant('a'), weight: weights[0] },
                { ...variant('b'), weight: weights[1] },
                { ...variant('c'), weight: weights[2] },
                fixed,
            ]);
            expect(
                normalized.variants!.reduce(
                    (total, item) => total + item.weight,
                    0,
                ),
            ).toBe(1000);
        }
    });

    test('rejects duplicate names, malformed JSON, all-fixed variants and overflowing fixed weights', async () => {
        const { service } = await createService();
        const invalid: IVariant[][] = [
            [variant('duplicate'), variant('duplicate')],
            [{ ...variant('json'), payload: { type: 'json', value: '{' } }],
            [{ ...variant('fixed'), weightType: 'fix', weight: 1000 }],
            [
                { ...variant('fixed-1'), weightType: 'fix', weight: 600 },
                { ...variant('fixed-2'), weightType: 'fix', weight: 600 },
                variant('variable'),
            ],
            [variant('negative', -1)],
            [variant('fractional', 0.5)],
        ];
        for (const variants of invalid) {
            await expect(
                service.normalize({ name: 'default', variants }),
            ).rejects.toThrow();
        }
    });

    test('returns sorted, redistributed weights without mutating the input', async () => {
        const { service } = await createService();
        const variants = [
            variant('c'),
            variant('a'),
            { ...variant('b', 101), weightType: 'fix' as const },
        ];
        const original = structuredClone(variants);
        const normalized = await service.normalize({
            name: 'default',
            variants,
        });
        expect(normalized.variants).toEqual([
            { ...variant('a'), weight: 449 },
            { ...variant('b', 101), weightType: 'fix' },
            { ...variant('c'), weight: 450 },
        ]);
        expect(variants).toEqual(original);
    });
});

describe('resource limits', () => {
    const constraint = (values = ['a']): IConstraint => ({
        contextName: 'custom',
        operator: 'IN',
        values,
    });

    test('checks proposed strategy count at the boundary', async () => {
        const { service } = await createService({
            featureEnvironmentStrategies: 2,
        });
        await expect(service.validateStrategyCount(2)).resolves.toBeUndefined();
        await expect(service.validateStrategyCount(3)).rejects.toMatchObject({
            resource: 'strategy',
            limit: 2,
        });
    });

    test('rejects growth above constraint limits but allows existing counts to stay or shrink', async () => {
        const { service } = await createService({ constraints: 1 });
        await expect(
            service.normalize({
                name: 'default',
                constraints: [constraint(), constraint()],
            }),
        ).rejects.toBeInstanceOf(StrategyValidationLimitError);
        for (const count of [1, 2]) {
            await expect(
                service.normalize(
                    {
                        name: 'default',
                        constraints: Array.from({ length: count }, () =>
                            constraint(),
                        ),
                    },
                    { existingConstraints: [constraint(), constraint()] },
                ),
            ).resolves.toHaveProperty('constraints.length', count);
        }
    });

    test('preserves existing constraint-value limit allowances and telemetry metadata', async () => {
        const { service } = await createService({ constraintValues: 1 });
        await expect(
            service.normalize({
                name: 'default',
                constraints: [constraint(['a', 'b'])],
            }),
        ).rejects.toMatchObject({
            resource: 'constraint values for custom',
            limit: 1,
            resourceNameOverride: 'constraint values',
        });
        await expect(
            service.normalize(
                { name: 'default', constraints: [constraint(['a', 'b'])] },
                { existingConstraints: [constraint(['a', 'b', 'c'])] },
            ),
        ).resolves.toHaveProperty('constraints.0.values', ['a', 'b']);
        await expect(
            service.normalize(
                { name: 'default', constraints: [constraint(['a', 'b', 'c'])] },
                { existingConstraints: [constraint(['a', 'b'])] },
            ),
        ).rejects.toBeInstanceOf(StrategyValidationLimitError);
    });
});

test('validates segment access when a destination is supplied', async () => {
    const { service, segmentService } = await createService();
    const segment = await segmentService.create(
        { name: 'other-project', project: 'other', constraints: [] },
        { id: 1, username: 'test', ip: '127.0.0.1' },
    );
    await expect(
        service.normalize(
            { name: 'default', segments: [segment.id] },
            { destination },
        ),
    ).rejects.toThrow('does not belong to project');
    await expect(
        service.normalize(
            { name: 'default', segments: [segment.id] },
            { destination: { ...destination, projectId: 'other' } },
        ),
    ).resolves.toHaveProperty('name', 'default');
});
