import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store.js';
import type { Db } from '../../db/db.js';
import { EventStore } from './event-store.js';
import FeatureTagStore from '../../db/feature-tag-store.js';
import { EventService } from '../../services/index.js';
import type {
    IEventStore,
    IFeatureTagStore,
    IUnleashConfig,
} from '../../types/index.js';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker.js';
import {
    createAccessReadModel,
    createFakeAccessReadModel,
} from '../access/createAccessReadModel.js';

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
    const privateProjectChecker = createPrivateProjectChecker(db, config);
    const accessReadModel = createAccessReadModel(db, config);
    return new EventService(
        { eventStore, featureTagStore },
        config,
        privateProjectChecker,
        accessReadModel,
    );
};

export const createFakeEventsService: (
    config: IUnleashConfig,
    stores?: {
        eventStore?: IEventStore;
        featureTagStore?: IFeatureTagStore;
    },
) => EventService = (config, stores) => {
    const eventStore = stores?.eventStore || new FakeEventStore();
    const featureTagStore =
        stores?.featureTagStore || new FakeFeatureTagStore();
    const fakePrivateProjectChecker = createFakePrivateProjectChecker();
    const fakeAccessReadModel = createFakeAccessReadModel();
    return new EventService(
        { eventStore, featureTagStore },
        config,
        fakePrivateProjectChecker,
        fakeAccessReadModel,
    );
};
