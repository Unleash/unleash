import { createFakeFeatureToggleService } from '../createFeatureToggleService';
import type {
    IAuditUser,
    IConstraint,
    IFlagResolver,
    IStrategyConfig,
    IUnleashConfig,
    IUser,
} from '../../../types';
import getLogger from '../../../../test/fixtures/no-logger';

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

        await expect(addStrategy()).rejects.toThrow(
            "Failed to create strategy. You can't create more than the established limit of 3",
        );
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
        ).rejects.toThrow(
            "Failed to create content values for userId. You can't create more than the established limit of 3",
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
