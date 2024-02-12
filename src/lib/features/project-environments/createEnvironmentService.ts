import { Db } from '../../db/db';
import { IUnleashConfig } from '../../types';
import { EventService } from '../../services';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import EnvironmentService from './environment-service';
import EnvironmentStore from './environment-store';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store';
import ProjectStore from '../project/project-store';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store';
import FakeEnvironmentStore from './fake-environment-store';
import { createEventsService } from '../events/createEventsService';

export const createEnvironmentService =
    (config: IUnleashConfig) =>
    (db: Db): EnvironmentService => {
        const { getLogger, eventBus, flagResolver } = config;
        const featureEnvironmentStore = new FeatureEnvironmentStore(
            db,
            eventBus,
            getLogger,
        );
        const projectStore = new ProjectStore(
            db,
            eventBus,
            getLogger,
            flagResolver,
        );
        const featureStrategiesStore = new FeatureStrategiesStore(
            db,
            eventBus,
            getLogger,
            flagResolver,
        );
        const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
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
    const eventStore = new FakeEventStore();
    const featureTagStore = new FakeFeatureTagStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const projectStore = new FakeProjectStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const environmentStore = new FakeEnvironmentStore();
    const eventService = new EventService(
        {
            eventStore,
            featureTagStore,
        },
        config,
    );

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
