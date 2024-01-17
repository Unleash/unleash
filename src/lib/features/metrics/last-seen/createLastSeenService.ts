import FakeFeatureToggleStore from '../../feature-toggle/fakes/fake-feature-toggle-store';
import FeatureToggleStore from '../../feature-toggle/feature-toggle-store';
import { Db, IUnleashConfig } from '../../../server-impl';
import { FakeLastSeenStore } from './fake-last-seen-store';
import { LastSeenService } from './last-seen-service';
import LastSeenStore from './last-seen-store';

export const createLastSeenService = (
    db: Db,
    config: IUnleashConfig,
): LastSeenService => {
    const lastSeenStore = new LastSeenStore(
        db,
        config.eventBus,
        config.getLogger,
    );

    const featureToggleStore = new FeatureToggleStore(
        db,
        config.eventBus,
        config.getLogger,
        config.flagResolver,
    );

    return new LastSeenService({ lastSeenStore, featureToggleStore }, config);
};

export const createFakeLastSeenService = (
    config: IUnleashConfig,
): LastSeenService => {
    const lastSeenStore = new FakeLastSeenStore();
    const featureToggleStore = new FakeFeatureToggleStore();

    return new LastSeenService({ lastSeenStore, featureToggleStore }, config);
};
