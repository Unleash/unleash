import type { Db, IUnleashConfig } from '../../server-impl';
import EnvironmentStore from '../project-environments/environment-store';
import { ApiTokenService, type EventService } from '../../services';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';
import type { IEnvironmentStore } from '../../types';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import FakeApiTokenStore from '../../../test/fixtures/fake-api-token-store';
import { ApiTokenStore } from '../../db/api-token-store';

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
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
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
