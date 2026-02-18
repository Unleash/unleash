import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import ContextService from './context-service.js';
import ContextFieldStore from './context-field-store.js';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import { PrivateProjectChecker } from '../private-project/privateProjectChecker.js';
import PrivateProjectStore from '../private-project/privateProjectStore.js';
import FakeContextFieldStore from './fake-context-field-store.js';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store.js';
import { FakePrivateProjectChecker } from '../private-project/fakePrivateProjectChecker.js';

export const createContextService =
    (config: IUnleashConfig) =>
    (db: Db): ContextService => {
        const { getLogger, flagResolver, eventBus, isEnterprise } = config;
        const contextFieldStore = new ContextFieldStore(
            db,
            getLogger,
            flagResolver,
        );
        const featureStrategiesStore = new FeatureStrategiesStore(
            db,
            eventBus,
            getLogger,
            flagResolver,
        );
        const eventService = createEventsService(db, config);
        const privateProjectStore = new PrivateProjectStore(db, getLogger);
        const privateProjectChecker = new PrivateProjectChecker(
            { privateProjectStore },
            { isEnterprise },
        );
        return new ContextService(
            { contextFieldStore, featureStrategiesStore },
            {
                getLogger,
                flagResolver,
            },
            eventService,
            privateProjectChecker,
        );
    };

export const createFakeContextService = (
    config: IUnleashConfig,
): ContextService => {
    const { getLogger, flagResolver } = config;
    const contextFieldStore = new FakeContextFieldStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const eventService = createFakeEventsService(config);
    const privateProjectChecker = new FakePrivateProjectChecker();
    return new ContextService(
        { contextFieldStore, featureStrategiesStore },
        {
            getLogger,
            flagResolver,
        },
        eventService,
        privateProjectChecker,
    );
};
