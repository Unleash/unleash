import { ClientFeatureToggleCache } from './client-feature-toggle-cache';
import EventStore from '../../events/event-store';
import ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';
import type { IUnleashConfig } from '../../../types';
import type { Db } from '../../../db/db';

import FeatureToggleClientStore from '../client-feature-toggle-store';

export const createClientFeatureToggleCache = (
    db: Db,
    config: IUnleashConfig,
): ClientFeatureToggleCache => {
    const { getLogger, eventBus, flagResolver } = config;

    const eventStore = new EventStore(db, getLogger);
    const featureToggleClientStore = new FeatureToggleClientStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );

    const configurationRevisionService =
        ConfigurationRevisionService.getInstance({ eventStore }, config);

    const clientFeatureToggleCache = new ClientFeatureToggleCache(
        featureToggleClientStore,
        eventStore,
        configurationRevisionService,
        flagResolver,
    );

    return clientFeatureToggleCache;
};
