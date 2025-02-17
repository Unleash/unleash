import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import ContextService from './context-service';
import ContextFieldStore from './context-field-store';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import { PrivateProjectChecker } from '../private-project/privateProjectChecker';
import PrivateProjectStore from '../private-project/privateProjectStore';
import FakeContextFieldStore from './fake-context-field-store';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store';
import { FakePrivateProjectChecker } from '../private-project/fakePrivateProjectChecker';

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
    const { getLogger, flagResolver, eventBus, isEnterprise } = config;
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
