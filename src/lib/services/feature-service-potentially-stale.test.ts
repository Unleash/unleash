import {
    FEATURE_POTENTIALLY_STALE_ON,
    IEvent,
    IUnleashConfig,
    IUnleashStores,
} from '../types';
import { createTestConfig } from '../../test/config/test-config';
import FeatureToggleService from '../features/feature-toggle/feature-toggle-service';
import { AccessService } from './access-service';
import { IChangeRequestAccessReadModel } from '../features/change-request-access-service/change-request-access-read-model';
import { ISegmentService } from '../features/segment/segment-service-interface';
import { IPrivateProjectChecker } from '../features/private-project/privateProjectCheckerType';
import { IDependentFeaturesReadModel } from '../features/dependent-features/dependent-features-read-model-type';
import EventService from '../features/events/event-service';
import FakeFeatureTagStore from '../../test/fixtures/fake-feature-tag-store';
import { DependentFeaturesService } from '../features/dependent-features/dependent-features-service';

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
                batchStore: async (events: IEvent[]) => {
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
        {} as ISegmentService,
        {} as AccessService,
        eventService,
        {} as IChangeRequestAccessReadModel,
        {} as IPrivateProjectChecker,
        {} as IDependentFeaturesReadModel,
        {} as DependentFeaturesService,
    );

    await featureToggleService.updatePotentiallyStaleFeatures();
});
