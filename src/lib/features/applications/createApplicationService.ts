import type { Db, IUnleashConfig, IUnleashStores } from '../../types/index.js';
import ClientApplicationsStore from '../../db/client-applications-store.js';
import { createEventsService } from '../events/createEventsService.js';
import type EventService from '../events/event-service.js';
import { ApplicationService } from './application-service.js';

export const createApplicationService = (
    db: Db,
    config: IUnleashConfig,
): ApplicationService => {
    const { eventBus, getLogger, flagResolver } = config;
    const clientApplicationsStore = new ClientApplicationsStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    return new ApplicationService(
        { clientApplicationsStore },
        createEventsService(db, config),
    );
};

export const createFakeApplicationService = (
    stores: Pick<IUnleashStores, 'clientApplicationsStore'>,
    eventService: EventService,
): ApplicationService => new ApplicationService(stores, eventService);
