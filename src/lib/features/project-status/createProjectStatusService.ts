import type { Db, IUnleashConfig } from '../../types/index.js';
import { ProjectStatusService } from './project-status-service.js';
import { EventStore } from '../events/event-store.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import ProjectStore from '../project/project-store.js';
import FakeProjectStore from '../../../test/fixtures/fake-project-store.js';
import FakeApiTokenStore from '../../../test/fixtures/fake-api-token-store.js';
import { ApiTokenStore } from '../../db/api-token-store.js';
import SegmentStore from '../segment/segment-store.js';
import FakeSegmentStore from '../../../test/fixtures/fake-segment-store.js';
import {
    createFakeProjectLifecycleSummaryReadModel,
    createProjectLifecycleSummaryReadModel,
} from './project-lifecycle-read-model/createProjectLifecycleSummaryReadModel.js';
import { ProjectStaleFlagsReadModel } from './project-stale-flags-read-model/project-stale-flags-read-model.js';
import { FakeProjectStaleFlagsReadModel } from './project-stale-flags-read-model/fake-project-stale-flags-read-model.js';
import FeatureTypeStore from '../../db/feature-type-store.js';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store.js';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store.js';
import FakeFeatureTypeStore from '../../../test/fixtures/fake-feature-type-store.js';

export const createProjectStatusService = (
    db: Db,
    config: IUnleashConfig,
): ProjectStatusService => {
    const eventStore = new EventStore(db, config.getLogger);
    const projectStore = new ProjectStore(db, config.eventBus, config);
    const apiTokenStore = new ApiTokenStore(
        db,
        config.eventBus,
        config.getLogger,
        config.flagResolver,
    );
    const segmentStore = new SegmentStore(
        db,
        config.eventBus,
        config.getLogger,
        config.flagResolver,
    );
    const projectLifecycleSummaryReadModel =
        createProjectLifecycleSummaryReadModel(db, config);
    const projectStaleFlagsReadModel = new ProjectStaleFlagsReadModel(db);

    const featureTypeStore = new FeatureTypeStore(db, config.getLogger);
    const featureToggleStore = new FeatureToggleStore(
        db,
        config.eventBus,
        config.getLogger,
        config.flagResolver,
    );

    return new ProjectStatusService(
        {
            eventStore,
            projectStore,
            apiTokenStore,
            segmentStore,
            featureTypeStore,
            featureToggleStore,
        },
        projectLifecycleSummaryReadModel,
        projectStaleFlagsReadModel,
    );
};

export const createFakeProjectStatusService = () => {
    const eventStore = new FakeEventStore();
    const projectStore = new FakeProjectStore();
    const apiTokenStore = new FakeApiTokenStore();
    const segmentStore = new FakeSegmentStore();
    const featureTypeStore = new FakeFeatureTypeStore();
    const featureToggleStore = new FakeFeatureToggleStore();
    const projectStatusService = new ProjectStatusService(
        {
            eventStore,
            projectStore,
            apiTokenStore,
            segmentStore,
            featureTypeStore,
            featureToggleStore,
        },
        createFakeProjectLifecycleSummaryReadModel(),
        new FakeProjectStaleFlagsReadModel(),
    );

    return {
        projectStatusService,
    };
};
