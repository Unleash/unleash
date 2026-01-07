import { ClientFeatureToggleDelta } from './client-feature-toggle-delta.js';
import { EventStore } from '../../events/event-store.js';
import ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service.js';
import type { IUnleashConfig } from '../../../types/index.js';
import type { Db } from '../../../db/db.js';
import ClientFeatureToggleDeltaReadModel from './client-feature-toggle-delta-read-model.js';
import { SegmentReadModel } from '../../segment/segment-read-model.js';

export const createClientFeatureToggleDelta = (
    db: Db,
    config: IUnleashConfig,
): ClientFeatureToggleDelta => {
    const { getLogger, eventBus, flagResolver } = config;

    const eventStore = new EventStore(db, getLogger);

    const clientFeatureToggleDeltaReadModel =
        new ClientFeatureToggleDeltaReadModel(db, eventBus);

    const configurationRevisionService =
        ConfigurationRevisionService.getInstance({ eventStore }, config);

    const segmentReadModel = new SegmentReadModel(db);

    const clientFeatureToggleDelta = ClientFeatureToggleDelta.getInstance(
        clientFeatureToggleDeltaReadModel,
        segmentReadModel,
        eventStore,
        configurationRevisionService,
        flagResolver,
        config,
    );

    return clientFeatureToggleDelta;
};
