import type { IUnleashConfig } from '../../types';
import FeatureLinkService from './feature-link-service';
import FakeFeatureLinkStore from './fake-feature-link-store';
import { createFakeEventsService } from '../events/createEventsService';

export const createFakeFeatureLinkService = (config: IUnleashConfig) => {
    const eventService = createFakeEventsService(config);
    const featureLinkStore = new FakeFeatureLinkStore();

    const featureLinkService = new FeatureLinkService(
        { featureLinkStore },
        config,
        eventService,
    );

    return { featureLinkService, featureLinkStore };
};
