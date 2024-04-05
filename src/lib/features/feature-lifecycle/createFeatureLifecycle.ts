import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakeFeatureLifecycleStore } from './fake-feature-lifecycle-store';
import { FeatureLifecycleService } from './feature-lifecycle-service';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';
import type { IUnleashConfig } from '../../types';

export const createFakeFeatureLifecycleService = (config: IUnleashConfig) => {
    const eventStore = new FakeEventStore();
    const featureLifecycleStore = new FakeFeatureLifecycleStore();
    const environmentStore = new FakeEnvironmentStore();
    const featureLifecycleService = new FeatureLifecycleService(
        {
            eventStore,
            featureLifecycleStore,
            environmentStore,
        },
        config,
    );

    return {
        featureLifecycleService,
        featureLifecycleStore,
        eventStore,
        environmentStore,
    };
};
