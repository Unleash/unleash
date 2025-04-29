import type { Db, IUnleashConfig } from '../../server-impl.js';
import EnvironmentStore from '../project-environments/environment-store.js';
import { ApiTokenService, type EventService } from '../../services/index.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import type { IEnvironmentStore } from '../../types/index.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import FakeApiTokenStore from '../../../test/fixtures/fake-api-token-store.js';
import { ApiTokenStore } from '../../db/api-token-store.js';

export const createApiTokenService = (
    db: Db,
    config: IUnleashConfig,
): ApiTokenService => {
    const { eventBus, getLogger } = config;
    const apiTokenStore = new ApiTokenStore(
        db,
        eventBus,
        getLogger,
        config.flagResolver,
    );
    const environmentStore = new EnvironmentStore(db, eventBus, config);
    const eventService = createEventsService(db, config);

    return new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
    );
};

export const createFakeApiTokenService = (
    config: IUnleashConfig,
): {
    apiTokenService: ApiTokenService;
    eventService: EventService;
    apiTokenStore: FakeApiTokenStore;
    environmentStore: IEnvironmentStore;
} => {
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();
    const eventService = createFakeEventsService(config);

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
    );

    return {
        apiTokenService,
        apiTokenStore,
        eventService,
        environmentStore,
    };
};
