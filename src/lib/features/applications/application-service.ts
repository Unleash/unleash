import type {
    IClientApplication,
    IClientApplicationsStore,
    ICreateClientApplication,
} from '../../types/stores/client-applications-store.js';
import {
    ApplicationCreatedEvent,
    type IAuditUser,
    type IUnleashStores,
} from '../../types/index.js';
import type EventService from '../events/event-service.js';

export class ApplicationService {
    private clientApplicationsStore: IClientApplicationsStore;

    private eventService: EventService;

    constructor(
        {
            clientApplicationsStore,
        }: Pick<IUnleashStores, 'clientApplicationsStore'>,
        eventService: EventService,
    ) {
        this.clientApplicationsStore = clientApplicationsStore;
        this.eventService = eventService;
    }

    async create(
        input: Omit<ICreateClientApplication, 'createdBy'>,
        auditUser: IAuditUser,
    ): Promise<IClientApplication> {
        const application = await this.clientApplicationsStore.create({
            appName: input.appName,
            description: input.description,
            createdBy: auditUser.username,
        });
        await this.eventService.storeEvent(
            new ApplicationCreatedEvent({ data: application, auditUser }),
        );
        return application;
    }
}
