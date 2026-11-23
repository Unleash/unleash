import type EventService from '../events/event-service.js';
import {
    FeaturePayloadSchemaUpdatedEvent,
    type IAuditUser,
} from '../../types/index.js';
import type { IPayloadSchemaStore } from './payload-schema-store-type.js';

export class ClonePayloadSchemaService {
    private payloadSchemaStore: IPayloadSchemaStore;

    private eventService: EventService;

    constructor({
        payloadSchemaStore,
        eventService,
    }: {
        payloadSchemaStore: IPayloadSchemaStore;
        eventService: EventService;
    }) {
        this.payloadSchemaStore = payloadSchemaStore;
        this.eventService = eventService;
    }

    async clonePayloadSchema({
        sourceFeatureName,
        targetFeatureName,
        project,
        auditUser,
    }: {
        sourceFeatureName: string;
        targetFeatureName: string;
        project: string;
        auditUser: IAuditUser;
    }): Promise<void> {
        const schema = await this.payloadSchemaStore.get(sourceFeatureName);
        if (!schema) {
            return;
        }
        await this.payloadSchemaStore.upsert(targetFeatureName, schema);
        await this.eventService.storeEvent(
            new FeaturePayloadSchemaUpdatedEvent({
                project,
                featureName: targetFeatureName,
                data: { schema },
                preData: null,
                auditUser,
            }),
        );
    }
}
