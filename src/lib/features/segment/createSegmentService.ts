import type { Db, IUnleashConfig } from '../../types/index.js';
import { ResourceLimitsService, SegmentService } from '../../services/index.js';
import type { ISegmentService } from './segment-service-interface.js';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store.js';
import SegmentStore from './segment-store.js';
import FakeSegmentStore from '../../../test/fixtures/fake-segment-store.js';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store.js';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel.js';
import {
    createChangeRequestSegmentUsageReadModel,
    createFakeChangeRequestSegmentUsageReadModel,
} from '../change-request-segment-usage-service/createChangeRequestSegmentUsageReadModel.js';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';

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

    const resourceLimitsService = new ResourceLimitsService(config);

    return new SegmentService(
        { segmentStore, featureStrategiesStore },
        changeRequestAccessReadModel,
        changeRequestSegmentUsageReadModel,
        config,
        eventService,
        privateProjectChecker,
        resourceLimitsService,
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

    const resourceLimitsService = new ResourceLimitsService(config);

    return new SegmentService(
        { segmentStore, featureStrategiesStore },
        changeRequestAccessReadModel,
        changeRequestSegmentUsageReadModel,
        config,
        eventService,
        privateProjectChecker,
        resourceLimitsService,
    );
};
