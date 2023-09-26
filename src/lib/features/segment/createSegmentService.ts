import { Db, IUnleashConfig } from 'lib/server-impl';
import EventStore from '../../db/event-store';
import { SegmentService } from '../../services';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { ISegmentService } from '../../segments/segment-service-interface';
import FeatureStrategiesStore from '../../db/feature-strategy-store';
import SegmentStore from '../../db/segment-store';
import FakeSegmentStore from '../../../test/fixtures/fake-segment-store';
import FakeFeatureStrategiesStore from '../../../test/fixtures/fake-feature-strategies-store';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker';

export const createSegmentService = (
    db: Db,
    config: IUnleashConfig,
): SegmentService => {
    const { eventBus, getLogger, flagResolver } = config;
    const eventStore = new EventStore(db, getLogger);
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
    const privateProjectChecker = createPrivateProjectChecker(db, config);

    return new SegmentService(
        { segmentStore, featureStrategiesStore, eventStore },
        changeRequestAccessReadModel,
        config,
        privateProjectChecker,
    );
};

export const createFakeSegmentService = (
    config: IUnleashConfig,
): ISegmentService => {
    const eventStore = new FakeEventStore();
    const segmentStore = new FakeSegmentStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const changeRequestAccessReadModel = createFakeChangeRequestAccessService();

    const privateProjectChecker = createFakePrivateProjectChecker();

    return new SegmentService(
        { segmentStore, featureStrategiesStore, eventStore },
        changeRequestAccessReadModel,
        config,
        privateProjectChecker,
    );
};
