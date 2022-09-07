import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import {
    IConstraint,
    IFeatureToggleClient,
    ISegment,
} from '../../../../lib/types/model';
import { randomId } from '../../../../lib/util/random-id';
import User from '../../../../lib/types/user';
import {
    DEFAULT_SEGMENT_VALUES_LIMIT,
    DEFAULT_STRATEGY_SEGMENTS_LIMIT,
} from '../../../../lib/util/segments';
import { collectIds } from '../../../../lib/util/collect-ids';
import { arraysHaveSameItems } from '../../../../lib/util/arraysHaveSameItems';

let db: ITestDb;
let app: IUnleashTest;

const FEATURES_ADMIN_BASE_PATH = '/api/admin/features';
const FEATURES_CLIENT_BASE_PATH = '/api/client/features';

const fetchSegments = (): Promise<ISegment[]> => {
    return app.services.segmentService.getAll();
};

const fetchFeatures = (): Promise<IFeatureToggleClient[]> => {
    return app.request
        .get(FEATURES_ADMIN_BASE_PATH)
        .expect(200)
        .then((res) => res.body.features);
};

const fetchClientFeatures = (): Promise<IFeatureToggleClient[]> => {
    return app.request
        .get(FEATURES_CLIENT_BASE_PATH)
        .expect(200)
        .then((res) => res.body.features);
};

const createSegment = (postData: object): Promise<unknown> => {
    return app.services.segmentService.create(postData, {
        email: 'test@example.com',
    });
};

const createFeatureToggle = (
    postData: object,
    expectStatusCode = 201,
): Promise<unknown> => {
    return app.request
        .post(FEATURES_ADMIN_BASE_PATH)
        .send(postData)
        .expect(expectStatusCode);
};

const addSegmentToStrategy = (
    segmentId: number,
    strategyId: string,
): Promise<unknown> => {
    return app.services.segmentService.addToStrategy(segmentId, strategyId);
};

const mockFeatureToggle = (): object => {
    return {
        name: randomId(),
        strategies: [{ name: randomId(), constraints: [], parameters: {} }],
    };
};

const mockConstraints = (): IConstraint[] => {
    return Array.from({ length: 5 }).map(() => ({
        values: ['x', 'y', 'z'],
        operator: 'IN',
        contextName: 'a',
    }));
};

const mockConstraintValues = (length: number): string[] => {
    return Array.from({ length }).map(() => {
        return randomId();
    });
};

const fetchClientResponse = (): Promise<{
    features: IFeatureToggleClient[];
    version: number;
    segments: ISegment[];
}> => {
    return app.request
        .get(FEATURES_CLIENT_BASE_PATH)
        .set('Unleash-Client-Spec', '4.2.0')
        .expect(200)
        .then((res) => res.body);
};

const createTestSegments = async () => {
    const constraints = mockConstraints();

    await createSegment({ name: 'S1', constraints });
    await createSegment({ name: 'S2', constraints });
    await createSegment({ name: 'S3', constraints });

    await createFeatureToggle(mockFeatureToggle());
    await createFeatureToggle(mockFeatureToggle());
    await createFeatureToggle(mockFeatureToggle());

    const [feature1, feature2] = await fetchFeatures();
    const [segment1, segment2] = await fetchSegments();
    await addSegmentToStrategy(segment1.id, feature1.strategies[0].id);
    await addSegmentToStrategy(segment2.id, feature1.strategies[0].id);
    await addSegmentToStrategy(segment2.id, feature2.strategies[0].id);
};

beforeAll(async () => {
    db = await dbInit('segments', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

afterEach(async () => {
    await db.stores.segmentStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.eventStore.deleteAll();
});

test('should validate segment constraint values limit', async () => {
    const constraints: IConstraint[] = [
        {
            contextName: randomId(),
            operator: 'IN',
            values: mockConstraintValues(DEFAULT_SEGMENT_VALUES_LIMIT + 1),
        },
    ];

    await expect(
        createSegment({ name: randomId(), constraints }),
    ).rejects.toThrow(
        `Segments may not have more than ${DEFAULT_SEGMENT_VALUES_LIMIT} values`,
    );
});

test('should validate segment constraint values limit with multiple constraints', async () => {
    const constraints: IConstraint[] = [
        {
            contextName: randomId(),
            operator: 'IN',
            values: mockConstraintValues(DEFAULT_SEGMENT_VALUES_LIMIT),
        },
        {
            contextName: randomId(),
            operator: 'IN',
            values: mockConstraintValues(1),
        },
    ];

    await expect(
        createSegment({ name: randomId(), constraints }),
    ).rejects.toThrow(
        `Segments may not have more than ${DEFAULT_SEGMENT_VALUES_LIMIT} values`,
    );
});

test('should validate feature strategy segment limit', async () => {
    await createSegment({ name: 'S1', constraints: [] });
    await createSegment({ name: 'S2', constraints: [] });
    await createSegment({ name: 'S3', constraints: [] });
    await createSegment({ name: 'S4', constraints: [] });
    await createSegment({ name: 'S5', constraints: [] });
    await createSegment({ name: 'S6', constraints: [] });
    await createFeatureToggle(mockFeatureToggle());
    const [feature1] = await fetchFeatures();
    const segments = await fetchSegments();

    await addSegmentToStrategy(segments[0].id, feature1.strategies[0].id);
    await addSegmentToStrategy(segments[1].id, feature1.strategies[0].id);
    await addSegmentToStrategy(segments[2].id, feature1.strategies[0].id);
    await addSegmentToStrategy(segments[3].id, feature1.strategies[0].id);
    await addSegmentToStrategy(segments[4].id, feature1.strategies[0].id);

    await expect(
        addSegmentToStrategy(segments[5].id, feature1.strategies[0].id),
    ).rejects.toThrow(
        `Strategies may not have more than ${DEFAULT_STRATEGY_SEGMENTS_LIMIT} segments`,
    );
});

test('should clone feature strategy segments', async () => {
    const constraints = mockConstraints();
    await createSegment({ name: 'S1', constraints });
    await createFeatureToggle(mockFeatureToggle());
    await createFeatureToggle(mockFeatureToggle());

    const [feature1, feature2] = await fetchFeatures();
    const strategy1 = feature1.strategies[0].id;
    const strategy2 = feature2.strategies[0].id;
    const [segment1] = await fetchSegments();
    await addSegmentToStrategy(segment1.id, feature1.strategies[0].id);

    let segments1 = await app.services.segmentService.getByStrategy(strategy1);
    let segments2 = await app.services.segmentService.getByStrategy(strategy2);
    expect(collectIds(segments1)).toEqual([segment1.id]);
    expect(collectIds(segments2)).toEqual([]);

    await app.services.segmentService.cloneStrategySegments(
        strategy1,
        strategy2,
    );

    segments1 = await app.services.segmentService.getByStrategy(strategy1);
    segments2 = await app.services.segmentService.getByStrategy(strategy2);
    expect(collectIds(segments1)).toEqual([segment1.id]);
    expect(collectIds(segments2)).toEqual([segment1.id]);
});

test('should store segment-created and segment-deleted events', async () => {
    const constraints = mockConstraints();
    const user = new User({ id: 1, email: 'test@example.com' });

    await createSegment({ name: 'S1', constraints });
    const [segment1] = await fetchSegments();
    await app.services.segmentService.delete(segment1.id, user);
    const events = await db.stores.eventStore.getEvents();

    expect(events[0].type).toEqual('segment-deleted');
    expect(events[0].data.id).toEqual(segment1.id);
    expect(events[1].type).toEqual('segment-created');
    expect(events[1].data.id).toEqual(segment1.id);
});

test('should inline segment constraints into features by default', async () => {
    await createTestSegments();

    const [feature1, feature2, feature3] = await fetchFeatures();
    const [, , segment3] = await fetchSegments();
    await addSegmentToStrategy(segment3.id, feature1.strategies[0].id);
    await addSegmentToStrategy(segment3.id, feature2.strategies[0].id);
    await addSegmentToStrategy(segment3.id, feature3.strategies[0].id);

    const clientFeatures = await fetchClientFeatures();
    const clientStrategies = clientFeatures.flatMap((f) => f.strategies);
    const clientConstraints = clientStrategies.flatMap((s) => s.constraints);
    const clientValues = clientConstraints.flatMap((c) => c.values);
    const uniqueValues = [...new Set(clientValues)];

    expect(clientFeatures.length).toEqual(3);
    expect(clientStrategies.length).toEqual(3);
    expect(clientConstraints.length).toEqual(5 * 6);
    expect(clientValues.length).toEqual(5 * 6 * 3);
    expect(uniqueValues.length).toEqual(3);
});

test('should only return segments to clients that support the spec', async () => {
    await createTestSegments();

    const [segment1, segment2] = await fetchSegments();
    const segmentIds = collectIds([segment1, segment2]);

    const unknownClientResponse = await app.request
        .get(FEATURES_CLIENT_BASE_PATH)
        .expect(200)
        .then((res) => res.body);
    const unknownClientConstraints = unknownClientResponse.features
        .flatMap((f) => f.strategies)
        .flatMap((s) => s.constraints);
    expect(unknownClientResponse.segments).toEqual(undefined);
    expect(unknownClientConstraints.length).toEqual(15);

    const supportedClientResponse = await app.request
        .get(FEATURES_CLIENT_BASE_PATH)
        .set('Unleash-Client-Spec', '4.2.0')
        .expect(200)
        .then((res) => res.body);
    const supportedClientConstraints = supportedClientResponse.features
        .flatMap((f) => f.strategies)
        .flatMap((s) => s.constraints);
    expect(collectIds(supportedClientResponse.segments)).toEqual(segmentIds);
    expect(supportedClientConstraints.length).toEqual(0);
});

test('should return segments in base of toggle response if inline is disabled', async () => {
    await createTestSegments();

    const clientFeatures = await fetchClientResponse();
    expect(clientFeatures.segments.length).toBeDefined();
});

test('should only send segments that are in use', async () => {
    await createTestSegments();

    const clientFeatures = await fetchClientResponse();
    expect(clientFeatures.segments.length).toEqual(2);
});

test('should send all segments that are in use by feature', async () => {
    await createTestSegments();

    const clientFeatures = await fetchClientResponse();
    const globalSegments = clientFeatures.segments;
    expect(globalSegments).toHaveLength(2);

    const globalSegmentIds = globalSegments.map((segment) => segment.id);
    const allSegmentIds = clientFeatures.features
        .map((feat) => feat.strategies.map((strategy) => strategy.segments))
        .flat()
        .flat()
        .filter((x) => !!x);
    const toggleSegmentIds = [...new Set(allSegmentIds)];
    expect(arraysHaveSameItems(globalSegmentIds, toggleSegmentIds)).toEqual(
        true,
    );
});
