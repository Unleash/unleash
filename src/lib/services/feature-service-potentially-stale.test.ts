import { IUnleashConfig, IUnleashStores } from '../types';
import { createTestConfig } from '../../test/config/test-config';
import FeatureToggleService from './feature-toggle-service';
import { AccessService } from './access-service';
import { IChangeRequestAccessReadModel } from 'lib/features/change-request-access-service/change-request-access-read-model';
import { ISegmentService } from 'lib/segments/segment-service-interface';

test('Should store events', async () => {
    expect.assertions(4);
    const featureUpdates = [
        { name: 'feature1', potentiallyStale: true },
        { name: 'feature2', potentiallyStale: false },
    ];

    const config = createTestConfig();
    const featureToggleService = new FeatureToggleService(
        {
            featureToggleStore: {
                updatePotentiallyStaleFeatures: () => featureUpdates,
            },
            eventStore: {
                batchStore: ([event1, event2]) => {
                    // expect 'feature1'
                    expect(event1.data).toMatchObject({
                        name: 'feature1',
                        potentiallyStale: true,
                    });
                    expect(event1.preData).toBeUndefined();
                    // expect 'feature1'
                    expect(event2.data).toMatchObject({
                        name: 'feature2',
                        potentiallyStale: false,
                    });
                    expect(event2.preData).toBeUndefined();
                },
            },
        } as unknown as IUnleashStores,
        {
            ...config,
            flagResolver: { isEnabled: () => true },
            experimental: {
                ...(config.experimental ?? {}),
                emitPotentiallyStaleEvents: true,
            },
        } as unknown as IUnleashConfig,
        {} as ISegmentService,
        {} as AccessService,
        {} as IChangeRequestAccessReadModel,
    );

    await featureToggleService.updatePotentiallyStaleFeatures();
});
