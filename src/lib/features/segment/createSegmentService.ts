import type { Db, IUnleashConfig } from '../../server-impl';
import { SegmentService } from '../../services';
import type { ISegmentService } from './segment-service-interface';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store';
import SegmentStore from './segment-store';
import FakeSegmentStore from '../../../test/fixtures/fake-segment-store';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel';
import {
    createChangeRequestSegmentUsageReadModel,
    createFakeChangeRequestSegmentUsageReadModel,
} from '../change-request-segment-usage-service/createChangeRequestSegmentUsageReadModel';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';

export const createSegmentService = (
    db: Db,
    config: IUnleashConfig,
): SegmentService => {
    const { eventBus, getLogger, flagResolver } = config;
    const segmentStore = new SegmentStore(
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
    const changeRequestAccessReadModel = createChangeRequestAccessReadModel(
        db,
        config,
    );

    const changeRequestSegmentUsageReadModel =
        createChangeRequestSegmentUsageReadModel(db);

    const privateProjectChecker = createPrivateProjectChecker(db, config);

    const eventService = createEventsService(db, config);

    return new SegmentService(
        { segmentStore, featureStrategiesStore },
        changeRequestAccessReadModel,
        changeRequestSegmentUsageReadModel,
        config,
        eventService,
        privateProjectChecker,
    );
};

export const createFakeSegmentService = (
    config: IUnleashConfig,
): ISegmentService => {
    const segmentStore = new FakeSegmentStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const changeRequestAccessReadModel = createFakeChangeRequestAccessService();
    const changeRequestSegmentUsageReadModel =
        createFakeChangeRequestSegmentUsageReadModel();

    const privateProjectChecker = createFakePrivateProjectChecker();

    const eventService = createFakeEventsService(config);

    return new SegmentService(
        { segmentStore, featureStrategiesStore },
        changeRequestAccessReadModel,
        changeRequestSegmentUsageReadModel,
        config,
        eventService,
        privateProjectChecker,
    );
};
