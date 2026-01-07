import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import EnvironmentService from './environment-service.js';
import EnvironmentStore from './environment-store.js';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store.js';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store.js';
import ProjectStore from '../project/project-store.js';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store.js';
import FakeProjectStore from '../../../test/fixtures/fake-project-store.js';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store.js';
import FakeEnvironmentStore from './fake-environment-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';

export const createEnvironmentService =
    (config: IUnleashConfig) =>
    (db: Db): EnvironmentService => {
        const { getLogger, eventBus, flagResolver } = config;
        const featureEnvironmentStore = new FeatureEnvironmentStore(
            db,
            eventBus,
            config,
        );
        const projectStore = new ProjectStore(db, eventBus, config);
        const featureStrategiesStore = new FeatureStrategiesStore(
            db,
            eventBus,
            getLogger,
            flagResolver,
        );
        const environmentStore = new EnvironmentStore(db, eventBus, config);
        const eventService = createEventsService(db, config);
        return new EnvironmentService(
            {
                environmentStore,
                featureStrategiesStore,
                featureEnvironmentStore,
                projectStore,
            },
            config,
            eventService,
        );
    };

export const createFakeEnvironmentService = (
    config: IUnleashConfig,
): EnvironmentService => {
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const projectStore = new FakeProjectStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const environmentStore = new FakeEnvironmentStore();
    const eventService = createFakeEventsService(config);

    return new EnvironmentService(
        {
            environmentStore,
            featureStrategiesStore,
            featureEnvironmentStore,
            projectStore,
        },
        config,
        eventService,
    );
};
