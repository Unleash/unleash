import FakeEventStore from '../../../test/fixtures/fake-event-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import type { Db } from '../../db/db';
import EventStore from './event-store';
import FeatureTagStore from '../../db/feature-tag-store';
import { EventService } from '../../services';
import type { IUnleashConfig } from '../../types';

export const createEventsService: (
    db: Db,
    config: IUnleashConfig,
) => EventService = (db, config) => {
    const eventStore = new EventStore(db, config.getLogger);
    const featureTagStore = new FeatureTagStore(
        db,
        config.eventBus,
        config.getLogger,
    );
    return new EventService({ eventStore, featureTagStore }, config);
};

export const createFakeEventsService: (config: IUnleashConfig) => EventService =
    (config) => {
        const eventStore = new FakeEventStore();
        const featureTagStore = new FakeFeatureTagStore();
        return new EventService({ eventStore, featureTagStore }, config);
    };
