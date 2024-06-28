import { createFakeFeatureToggleService } from '../createFeatureToggleService';
import type {
    IAuditUser,
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
    const { featureToggleService, featureToggleStore } =
        createFakeFeatureToggleService({
            getLogger,
            flagResolver: alwaysOnFlagResolver,
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

    for (let i = 0; i < 30; i++) {
        await addStrategy();
    }

    await expect(addStrategy()).rejects.toThrow(
        'Strategy limit of 30 exceeded',
    );
});
