import FakeEventStore from '../../../test/fixtures/fake-event-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import type { Db } from '../../db/db';
import EventStore from './event-store';
import FeatureTagStore from '../../db/feature-tag-store';
import { EventService } from '../../services';
import type { IUnleashConfig } from '../../types';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker';

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
    return new EventService(
        { eventStore, featureTagStore },
        config,
        privateProjectChecker,
    );
};

export const createFakeEventsService: (config: IUnleashConfig) => EventService =
    (config) => {
        const eventStore = new FakeEventStore();
        const featureTagStore = new FakeFeatureTagStore();
        const fakePrivateProjectChecker = createFakePrivateProjectChecker();
        return new EventService(
            { eventStore, featureTagStore },
            config,
            fakePrivateProjectChecker,
        );
    };
