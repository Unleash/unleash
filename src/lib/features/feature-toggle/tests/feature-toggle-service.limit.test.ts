import { createFakeFeatureToggleService } from '../createFeatureToggleService';
import type {
    IAuditUser,
    IConstraint,
    IFlagResolver,
    IStrategyConfig,
    IUnleashConfig,
} from '../../../types';
import getLogger from '../../../../test/fixtures/no-logger';

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

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
