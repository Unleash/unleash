import { Db } from '../../db/db';
import EventStore from '../../db/event-store';
import { IUnleashConfig } from '../../types';
import { EventService } from '../../services';
import FeatureTagStore from '../../db/feature-tag-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import TagTypeService from './tag-type-service';
import TagTypeStore from './tag-type-store';
import FakeTagTypeStore from './fake-tag-type-store';

export const createTagTypeService =
    (config: IUnleashConfig) =>
    (db: Db): TagTypeService => {
        const { getLogger, eventBus } = config;
        const eventStore = new EventStore(db, getLogger);
        const featureTagStore = new FeatureTagStore(db, eventBus, getLogger);
        const eventService = new EventService(
            {
                eventStore,
                featureTagStore,
            },
            config,
        );
        const tagTypeStore = new TagTypeStore(db, eventBus, getLogger);
        return new TagTypeService({ tagTypeStore }, config, eventService);
    };

export const createFakeTagTypeService = (
    config: IUnleashConfig,
): TagTypeService => {
    const eventStore = new FakeEventStore();
    const featureTagStore = new FakeFeatureTagStore();
    const eventService = new EventService(
        {
            eventStore,
            featureTagStore,
        },
        config,
    );
    const tagTypeStore = new FakeTagTypeStore();

    return new TagTypeService({ tagTypeStore }, config, eventService);
};
