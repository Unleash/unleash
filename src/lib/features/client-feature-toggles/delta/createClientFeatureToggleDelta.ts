import { ClientFeatureToggleDelta } from './client-feature-toggle-delta';
import EventStore from '../../events/event-store';
import ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';
import type { IUnleashConfig } from '../../../types';
import type { Db } from '../../../db/db';
import ClientFeatureToggleDeltaReadModel from './client-feature-toggle-delta-read-model';
import { SegmentReadModel } from '../../segment/segment-read-model';

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
