import type { Db, IUnleashConfig } from '../../types/index.js';
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
import { ResourceLimitsService } from '../resource-limits/resource-limits-service.js';

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
    const resourceLimitsService = new ResourceLimitsService(config);

    return new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
        resourceLimitsService,
    );
};

export const createFakeApiTokenService = (
    config: IUnleashConfig,
): {
    apiTokenService: ApiTokenService;
    eventService: EventService;
    resourceLimitsService: ResourceLimitsService;
    apiTokenStore: FakeApiTokenStore;
    environmentStore: IEnvironmentStore;
} => {
    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();
    const eventService = createFakeEventsService(config);
    const resourceLimitsService = new ResourceLimitsService(config);

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
        resourceLimitsService,
    );

    return {
        apiTokenService,
        apiTokenStore,
        eventService,
        resourceLimitsService,
        environmentStore,
    };
};
