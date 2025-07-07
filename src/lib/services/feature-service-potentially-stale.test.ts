import type { IUnleashConfig, IUnleashStores } from '../types/index.js';
import { createTestConfig } from '../../test/config/test-config.js';
import {
    FeatureToggleService,
    type ServicesAndReadModels,
} from '../features/feature-toggle/feature-toggle-service.js';
import EventService from '../features/events/event-service.js';
import FakeFeatureTagStore from '../../test/fixtures/fake-feature-tag-store.js';
import {
    FEATURE_POTENTIALLY_STALE_ON,
    type IBaseEvent,
} from '../events/index.js';

test('Should only store events for potentially stale on', async () => {
    expect.assertions(2);
    const featureUpdates = [
        { name: 'feature1', potentiallyStale: true, project: 'default' },
        { name: 'feature2', potentiallyStale: false, project: 'default' },
    ];

    const config = createTestConfig();
    const eventService = new EventService(
        {
            // @ts-expect-error
            eventStore: {
                batchStore: async (events: IBaseEvent[]) => {
                    expect(events.length).toBe(1);
                    const [event1] = events;

                    expect(event1).toMatchObject({
                        featureName: 'feature1',
                        project: 'default',
                        type: FEATURE_POTENTIALLY_STALE_ON,
                    });
                },
            },
            featureTagStore: new FakeFeatureTagStore(),
        },
        config,
        {},
        {},
    );

    const featureToggleService = new FeatureToggleService(
        {
            featureToggleStore: {
                updatePotentiallyStaleFeatures: () => featureUpdates,
            },
            featureTagStore: {
                getAllTagsForFeature: () => [],
            },
        } as unknown as IUnleashStores,
        {
            ...config,
            flagResolver: { isEnabled: () => true },
            experimental: {
                ...(config.experimental ?? {}),
            },
        } as unknown as IUnleashConfig,
        { eventService } as ServicesAndReadModels,
    );

    await featureToggleService.updatePotentiallyStaleFeatures();
});
