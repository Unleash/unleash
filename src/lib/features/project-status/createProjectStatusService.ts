import type { Db, IUnleashConfig } from '../../server-impl';
import { ProjectStatusService } from './project-status-service';
import EventStore from '../events/event-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import ProjectStore from '../project/project-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeApiTokenStore from '../../../test/fixtures/fake-api-token-store';
import { ApiTokenStore } from '../../db/api-token-store';
import SegmentStore from '../segment/segment-store';
import FakeSegmentStore from '../../../test/fixtures/fake-segment-store';
import {
    createFakeProjectLifecycleSummaryReadModel,
    createProjectLifecycleSummaryReadModel,
} from './project-lifecycle-read-model/createProjectLifecycleSummaryReadModel';
import { ProjectStaleFlagsReadModel } from './project-stale-flags-read-model/project-stale-flags-read-model';
import { FakeProjectStaleFlagsReadModel } from './project-stale-flags-read-model/fake-project-stale-flags-read-model';
import FeatureTypeStore from '../../db/feature-type-store';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store';
import FakeFeatureTypeStore from '../../../test/fixtures/fake-feature-type-store';

export const createProjectStatusService = (
    db: Db,
    config: IUnleashConfig,
): ProjectStatusService => {
    const eventStore = new EventStore(db, config.getLogger);
    const projectStore = new ProjectStore(
        db,
        config.eventBus,
        config.getLogger,
        config.flagResolver,
    );
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
