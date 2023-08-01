import { Db, IUnleashConfig } from 'lib/server-impl';
import EventStore from '../../db/event-store';
import { SegmentService } from '../../services';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { ISegmentService } from '../../segments/segment-service-interface';
import FeatureStrategiesStore from '../../db/feature-strategy-store';
import SegmentStore from '../../db/segment-store';
import FakeSegmentStore from '../../../test/fixtures/fake-segment-store';
import FakeFeatureStrategiesStore from '../../../test/fixtures/fake-feature-strategies-store';

export const createSegmentService = (
    db: Db,
    config: IUnleashConfig,
): ISegmentService => {
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

    return new SegmentService(
        { segmentStore, featureStrategiesStore, eventStore },
        config,
    );
};

export const createFakeSegmentService = (
    config: IUnleashConfig,
): ISegmentService => {
    const eventStore = new FakeEventStore();
    const segmentStore = new FakeSegmentStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();

    return new SegmentService(
        { segmentStore, featureStrategiesStore, eventStore },
        config,
    );
};
