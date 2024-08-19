import type { Db, IUnleashConfig } from '../../../server-impl';
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

    return new LastSeenService({ lastSeenStore }, config);
};

export const createFakeLastSeenService = (
    config: IUnleashConfig,
): LastSeenService => {
    const lastSeenStore = new FakeLastSeenStore();

    return new LastSeenService({ lastSeenStore }, config);
};
