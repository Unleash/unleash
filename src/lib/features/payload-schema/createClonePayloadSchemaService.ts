import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import { ClonePayloadSchemaService } from './clone-payload-schema-service.js';
import { FakePayloadSchemaStore } from './fake-payload-schema-store.js';
import { PayloadSchemaStore } from './payload-schema-store.js';

export const createClonePayloadSchemaService =
    (config: IUnleashConfig) => (db: Db) =>
        new ClonePayloadSchemaService({
            payloadSchemaStore: new PayloadSchemaStore(db),
            eventService: createEventsService(db, config),
        });

export const createFakeClonePayloadSchemaService = (config: IUnleashConfig) =>
    new ClonePayloadSchemaService({
        payloadSchemaStore: new FakePayloadSchemaStore(),
        eventService: createFakeEventsService(config),
    });
