import {
    FEATURE_POTENTIALLY_STALE_ON,
    IEvent,
    IUnleashConfig,
    IUnleashStores,
} from '../types';
import { createTestConfig } from '../../test/config/test-config';
import FeatureToggleService from './feature-toggle-service';
import { AccessService } from './access-service';
import { IChangeRequestAccessReadModel } from 'lib/features/change-request-access-service/change-request-access-read-model';
import { SegmentService } from './segment-service';

test('Should only store events for potentially stale on', async () => {
    expect.assertions(2);
    const featureUpdates = [
        { name: 'feature1', potentiallyStale: true, project: 'default' },
        { name: 'feature2', potentiallyStale: false, project: 'default' },
    ];

    const config = createTestConfig();
    const featureToggleService = new FeatureToggleService(
        {
            featureToggleStore: {
                updatePotentiallyStaleFeatures: () => featureUpdates,
            },
            featureTagStore: {
                getAllTagsForFeature: () => [],
            },
            eventStore: {
                batchStore: (events: IEvent[]) => {
                    expect(events.length).toBe(1);
                    const [event1] = events;

                    expect(event1).toMatchObject({
                        featureName: 'feature1',
                        project: 'default',
                        type: FEATURE_POTENTIALLY_STALE_ON,
                    });
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
        {} as SegmentService,
        {} as AccessService,
        {} as IChangeRequestAccessReadModel,
    );

    await featureToggleService.updatePotentiallyStaleFeatures();
});
