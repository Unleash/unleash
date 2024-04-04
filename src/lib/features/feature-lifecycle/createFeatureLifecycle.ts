import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakeFeatureLifecycleStore } from './fake-feature-lifecycle-store';
import { FeatureLifecycleService } from './feature-lifecycle-service';

export const createFakeFeatureLifecycleService = () => {
    const eventStore = new FakeEventStore();
    const featureLifecycleStore = new FakeFeatureLifecycleStore();
    const featureLifecycleService = new FeatureLifecycleService({
        eventStore,
        featureLifecycleStore,
    });

    return { featureLifecycleService, featureLifecycleStore, eventStore };
};
