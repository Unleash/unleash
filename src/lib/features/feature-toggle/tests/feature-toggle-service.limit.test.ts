import { createFakeFeatureToggleService } from '../createFeatureToggleService.js';
import type {
    IAuditUser,
    IConstraint,
    IFlagResolver,
    IStrategyConfig,
    IUnleashConfig,
    IUser,
} from '../../../types/index.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { ExceedsLimitError } from '../../../error/exceeds-limit-error.js';
import { describe, test, expect } from 'vitest';
import { DEFAULT_ENV } from '../../../server-impl.js';
const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

describe('Strategy limits', () => {
    test('Should not allow to exceed strategy limit', async () => {
        const LIMIT = 3;
        const { featureToggleService, featureToggleStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOnFlagResolver,
                resourceLimits: {
                    featureEnvironmentStrategies: LIMIT,
                },
            } as unknown as IUnleashConfig);

        const addStrategy = () =>
            featureToggleService.unprotectedCreateStrategy(
                { name: 'default', featureName: 'feature' } as IStrategyConfig,
                { projectId: 'default', featureName: 'feature' } as any,
                {} as IAuditUser,
            );
        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });

        for (let i = 0; i < LIMIT; i++) {
            await addStrategy();
        }

        await expect(addStrategy()).rejects.toThrowError(
            "Failed to create strategy. You can't create more than the established limit of 3",
        );
    });

    test('Should not allow to exceed constraints limit', async () => {
        const LIMIT = 1;
        const { featureToggleService, featureToggleStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOnFlagResolver,
                resourceLimits: {
                    constraints: LIMIT,
                },
            } as unknown as IUnleashConfig);

        const addStrategy = (constraints: IConstraint[]) =>
            featureToggleService.unprotectedCreateStrategy(
                {
                    name: 'default',
                    featureName: 'feature',
                    constraints: constraints,
                } as IStrategyConfig,
                { projectId: 'default', featureName: 'feature' } as any,
                {} as IAuditUser,
            );
        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });

        await expect(
            addStrategy([
                {
                    values: ['1'],
                    operator: 'IN',
                    contextName: 'accountId',
                },
                {
                    values: ['2'],
                    operator: 'IN',
                    contextName: 'accountId',
                },
            ]),
        ).rejects.toThrowError(
            "Failed to create constraints. You can't create more than the established limit of 1",
        );
    });

    test('Should not throw limit exceeded errors if the new number of constraints is less than or equal to the previous number', async () => {
        const LIMIT = 1;
        const { featureToggleService, featureStrategiesStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOnFlagResolver,
                resourceLimits: {
                    constraints: LIMIT,
                },
            } as unknown as IUnleashConfig);

        const constraints: IConstraint[] = [
            {
                values: ['1'],
                operator: 'IN',
                contextName: 'appName',
            },
            {
                values: ['2'],
                operator: 'IN',
                contextName: 'appName',
            },
            {
                values: ['3'],
                operator: 'IN',
                contextName: 'appName',
            },
        ];

        const flagName = 'feature';

        await featureStrategiesStore.createFeature({
            name: flagName,
            createdByUserId: 1,
        });

        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            parameters: {},
            strategyName: 'default',
            featureName: flagName,
            constraints: constraints,
            projectId: 'default',
            environment: DEFAULT_ENV,
        });

        const updateStrategy = (newConstraints) =>
            featureToggleService.unprotectedUpdateStrategy(
                strategy.id,
                {
                    constraints: newConstraints,
                },
                {
                    projectId: 'default',
                    featureName: 'feature',
                    environment: DEFAULT_ENV,
                },
                {} as IAuditUser,
            );

        // check that you can save the same amount of constraints
        await updateStrategy(constraints);
        // check that you can save fewer constraints but still over the limit
        await updateStrategy(constraints.slice(0, 2));

        // check that you can't save more constraints
        await expect(async () =>
            updateStrategy([...constraints, ...constraints]),
        ).rejects.errorWithMessage(new ExceedsLimitError('constraints', LIMIT));
    });

    test('Should not allow to exceed constraint values limit', async () => {
        const LIMIT = 3;
        const { featureToggleService, featureToggleStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOnFlagResolver,
                resourceLimits: {
                    constraintValues: LIMIT,
                },
            } as unknown as IUnleashConfig);

        const addStrategyWithConstraints = (constraints: IConstraint[]) =>
            featureToggleService.unprotectedCreateStrategy(
                {
                    name: 'default',
                    featureName: 'feature',
                    constraints,
                } as IStrategyConfig,
                { projectId: 'default', featureName: 'feature' } as any,
                {} as IAuditUser,
            );
        await featureToggleStore.create('default', {
            name: 'feature',
            createdByUserId: 1,
        });
        await expect(() =>
            addStrategyWithConstraints([
                {
                    contextName: 'userId',
                    operator: 'IN',
                    values: ['1', '2', '3', '4'],
                },
            ]),
        ).rejects.toThrowError(
            "Failed to create constraint values for userId. You can't create more than the established limit of 3",
        );
    });

    test('Should not throw limit exceeded errors for constraint values if the new values are less than or equal to the old values AND there have been no other constraint updates (re-ordering or deleting)', async () => {
        const LIMIT = 1;
        const { featureToggleService, featureStrategiesStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOnFlagResolver,
                resourceLimits: {
                    constraintValues: LIMIT,
                },
            } as unknown as IUnleashConfig);

        const constraints = (valueCount: number) =>
            [
                {
                    values: Array.from({ length: valueCount }).map((_, i) =>
                        i.toString(),
                    ),
                    operator: 'IN',
                    contextName: 'appName',
                },
                {
                    values: ['a', 'b', 'c'],
                    operator: 'IN',
                    contextName: 'appName',
                },
            ] as IConstraint[];

        const flagName = 'feature';

        await featureStrategiesStore.createFeature({
            name: flagName,
            createdByUserId: 1,
        });

        const initialConstraintValueCount = LIMIT + 2;
        const strategy = await featureStrategiesStore.createStrategyFeatureEnv({
            parameters: {},
            strategyName: 'default',
            featureName: flagName,
            constraints: constraints(initialConstraintValueCount),
            projectId: 'default',
            environment: DEFAULT_ENV,
        });

        const updateStrategy = (valueCount) =>
            featureToggleService.unprotectedUpdateStrategy(
                strategy.id,
                {
                    constraints: constraints(valueCount),
                },
                {
                    projectId: 'default',
                    featureName: 'feature',
                    environment: DEFAULT_ENV,
                },
                {} as IAuditUser,
            );

        // check that you can save the same amount of constraint values
        await updateStrategy(initialConstraintValueCount);
        // check that you can save fewer constraint values but still over the limit
        await updateStrategy(initialConstraintValueCount - 1);

        // check that you can't save more constraint values
        await expect(async () =>
            updateStrategy(initialConstraintValueCount + 1),
        ).rejects.errorWithMessage(
            new ExceedsLimitError('constraint values for appName', LIMIT),
        );
    });
});

describe('Flag limits', () => {
    test('Should not allow you to exceed the flag limit', async () => {
        const LIMIT = 3;
        const { featureToggleService, projectStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOnFlagResolver,
                resourceLimits: {
                    featureFlags: LIMIT,
                },
            } as unknown as IUnleashConfig);

        await projectStore.create({
            name: 'default',
            description: 'default',
            id: 'default',
        });

        const createFlag = (name: string) =>
            featureToggleService.createFeatureToggle(
                'default',
                { name },
                {} as IAuditUser,
            );

        for (let i = 0; i < LIMIT; i++) {
            await createFlag(`feature-${i}`);
        }

        await expect(createFlag('excessive')).rejects.toThrow(
            "Failed to create feature flag. You can't create more than the established limit of 3",
        );
    });

    test('Archived flags do not count towards the total', async () => {
        const LIMIT = 1;
        const { featureToggleService, projectStore } =
            createFakeFeatureToggleService({
                getLogger,
                flagResolver: alwaysOnFlagResolver,
                resourceLimits: {
                    featureFlags: LIMIT,
                },
            } as unknown as IUnleashConfig);

        await projectStore.create({
            name: 'default',
            description: 'default',
            id: 'default',
        });

        const createFlag = (name: string) =>
            featureToggleService.createFeatureToggle(
                'default',
                { name },
                {} as IAuditUser,
            );

        await createFlag('to-be-archived');

        await featureToggleService.archiveToggle(
            'to-be-archived',
            {} as IUser,
            {} as IAuditUser,
        );

        await expect(createFlag('should-be-okay')).resolves.toMatchObject({
            name: 'should-be-okay',
        });
    });
});
