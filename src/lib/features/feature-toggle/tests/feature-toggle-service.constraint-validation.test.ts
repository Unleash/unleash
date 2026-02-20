import { createFakeFeatureToggleService } from '../createFeatureToggleService.js';
import type {
    IAuditUser,
    IFlagResolver,
    IStrategyConfig,
    IUnleashConfig,
} from '../../../types/index.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { REGEX } from '../../../util/constants.js';
import { describe, test, expect } from 'vitest';
import { DEFAULT_ENV } from '../../../server-impl.js';

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

const createService = () =>
    createFakeFeatureToggleService({
        getLogger,
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: {},
    } as unknown as IUnleashConfig);

describe('Constraint validation via create strategy', () => {
    test('should reject invalid regex', async () => {
        const { featureToggleService, featureToggleStore } = createService();

        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });

        await expect(
            featureToggleService.createStrategy(
                {
                    name: 'default',
                    featureName: 'feature',
                    constraints: [
                        {
                            contextName: 'someField',
                            operator: REGEX,
                            value: '(unclosed',
                            values: [],
                        },
                    ],
                } as IStrategyConfig,
                { projectId: 'default', featureName: 'feature' } as any,
                {} as IAuditUser,
            ),
        ).rejects.toThrow('not a valid regex string');
    });

    test('should accept valid regex', async () => {
        const { featureToggleService, featureToggleStore } = createService();

        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });

        const result = await featureToggleService.unprotectedCreateStrategy(
            {
                name: 'default',
                featureName: 'feature',
                constraints: [
                    {
                        contextName: 'someField',
                        operator: REGEX,
                        value: '^[a-z]+$',
                        values: [],
                    },
                ],
            } as IStrategyConfig,
            { projectId: 'default', featureName: 'feature' } as any,
            {} as IAuditUser,
        );

        expect(result.constraints?.[0].operator).toBe(REGEX);
    });

    test('should validate regex value against legal values', async () => {
        const { featureToggleService, featureToggleStore, contextFieldStore } =
            createService();

        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });

        await contextFieldStore.create({
            name: 'customField',
            description: 'A custom field',
            sortOrder: 0,
            stickiness: false,
            legalValues: [
                { value: '^valid-pattern$' },
                { value: '^another-pattern$' },
            ],
        });

        await expect(
            featureToggleService.createStrategy(
                {
                    name: 'default',
                    featureName: 'feature',
                    constraints: [
                        {
                            contextName: 'customField',
                            operator: REGEX,
                            value: '^valid-pattern$',
                            values: [],
                        },
                    ],
                } as IStrategyConfig,
                { projectId: 'default', featureName: 'feature' } as any,
                {} as IAuditUser,
            ),
        ).resolves.toBeDefined();

        await expect(
            featureToggleService.createStrategy(
                {
                    name: 'default',
                    featureName: 'feature',
                    constraints: [
                        {
                            contextName: 'customField',
                            operator: REGEX,
                            value: '^not-a-legal-value$',
                            values: [],
                        },
                    ],
                } as IStrategyConfig,
                { projectId: 'default', featureName: 'feature' } as any,
                {} as IAuditUser,
            ),
        ).rejects.toThrow('is not specified as a legal value');
    });

    test('REGEX operator checks value (singular), not values, for legal value validation', async () => {
        const { featureToggleService, featureToggleStore, contextFieldStore } =
            createService();

        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });

        await contextFieldStore.create({
            name: 'regexField',
            description: 'Field with legal values',
            sortOrder: 0,
            stickiness: false,
            legalValues: [{ value: '^allowed$' }],
        });

        await expect(
            featureToggleService.createStrategy(
                {
                    name: 'default',
                    featureName: 'feature',
                    constraints: [
                        {
                            contextName: 'regexField',
                            operator: REGEX,
                            value: '^allowed$',
                            values: ['not-in-legal-values'],
                        },
                    ],
                } as IStrategyConfig,
                { projectId: 'default', featureName: 'feature' } as any,
                {} as IAuditUser,
            ),
        ).resolves.toBeDefined();
    });
});

describe('Constraint validation via update strategy', () => {
    test('should reject invalid regex', async () => {
        const { featureToggleService, featureStrategiesStore } = createService();

        await featureStrategiesStore.createFeature({
            name: 'feature',
            createdByUserId: 1,
        });

        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            parameters: {},
            strategyName: 'default',
            featureName: 'feature',
            constraints: [],
            projectId: 'default',
            environment: DEFAULT_ENV,
        });

        await expect(
            featureToggleService.updateStrategy(
                strategy.id,
                {
                    constraints: [
                        {
                            contextName: 'someField',
                            operator: REGEX,
                            value: '(unclosed',
                            values: [],
                        },
                    ],
                },
                {
                    projectId: 'default',
                    featureName: 'feature',
                    environment: DEFAULT_ENV,
                },
                {} as IAuditUser,
            ),
        ).rejects.toThrow('not a valid regex string');
    });

    test('should accept valid regex', async () => {
        const { featureToggleService, featureStrategiesStore } = createService();

        await featureStrategiesStore.createFeature({
            name: 'feature',
            createdByUserId: 1,
        });

        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            parameters: {},
            strategyName: 'default',
            featureName: 'feature',
            constraints: [],
            projectId: 'default',
            environment: DEFAULT_ENV,
        });

        const result = await featureToggleService.unprotectedUpdateStrategy(
            strategy.id,
            {
                constraints: [
                    {
                        contextName: 'someField',
                        operator: REGEX,
                        value: '^[a-z]+$',
                        values: [],
                    },
                ],
            },
            {
                projectId: 'default',
                featureName: 'feature',
                environment: DEFAULT_ENV,
            },
            {} as IAuditUser,
        );

        expect(result.constraints?.[0].operator).toBe(REGEX);
    });
});
