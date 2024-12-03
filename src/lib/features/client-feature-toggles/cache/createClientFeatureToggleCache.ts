import FeatureToggleClientStore from '../client-feature-toggles/client-feature-toggle-store';
import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import { SegmentReadModel } from '../segment/segment-read-model';
import { ClientFeatureToggleCache } from './client-feature-toggle-cache';
import { createFeatureToggleService } from '../../feature-toggle/createFeatureToggleService';
import EventStore from '../../events/event-store';
import ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';

export const createClientFeatureToggleCache = (
    db: Db,
    config: IUnleashConfig,
): ClientFeatureToggleCache => {
    const { getLogger, eventBus, flagResolver } = config;

    const featureToggleClientStore = new FeatureToggleClientStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );

    const segmentReadModel = new SegmentReadModel(db);

    const eventStore = new EventStore(db, getLogger);
    const featureToggleServiceV2 = createFeatureToggleService(db, config);

    const configurationRevisionService =
        ConfigurationRevisionService.getInstance(stores, config);

    const clientFeatureToggleCache = new ClientFeatureToggleCache(
        featureToggleServiceV2,
        eventStore,
    );

    return clientFeatureToggleCache;
};
