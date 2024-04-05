import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakeFeatureLifecycleStore } from './fake-feature-lifecycle-store';
import { FeatureLifecycleService } from './feature-lifecycle-service';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';

export const createFakeFeatureLifecycleService = () => {
    const eventStore = new FakeEventStore();
    const featureLifecycleStore = new FakeFeatureLifecycleStore();
    const environmentStore = new FakeEnvironmentStore();
    const featureLifecycleService = new FeatureLifecycleService({
        eventStore,
        featureLifecycleStore,
        environmentStore,
    });

    return {
        featureLifecycleService,
        featureLifecycleStore,
        eventStore,
        environmentStore,
    };
};
