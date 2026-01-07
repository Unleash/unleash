import type { Db, IUnleashConfig } from '../../../types/index.js';
import { FakeLastSeenStore } from './fake-last-seen-store.js';
import { LastSeenService } from './last-seen-service.js';
import LastSeenStore from './last-seen-store.js';

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
