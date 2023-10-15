import { randomId } from '../../../../lib/util/random-id';
import {
    IFeatureStrategy,
    IFeatureToggleClient,
    ISegment,
} from '../../../../lib/types/model';
import { collectIds } from '../../../../lib/util/collect-ids';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import {
    addStrategyToFeatureEnv,
    createFeatureToggle,
} from '../../helpers/app.utils';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';

let app: IUnleashTest;
let db: ITestDb;

const SEGMENTS_BASE_PATH = '/api/admin/segments';
const FEATURES_LIST_BASE_PATH = '/api/admin/features';

// Recursively change all Date properties to string properties.
type SerializeDatesDeep<T> = {
    [P in keyof T]: T[P] extends Date ? string : SerializeDatesDeep<T[P]>;
};

const fetchSegments = (): Promise<SerializeDatesDeep<ISegment[]>> =>
    app.request
        .get(SEGMENTS_BASE_PATH)
        .expect(200)
        .then((res) => res.body.segments);

const fetchSegmentsByStrategy = (
    strategyId: string,
): Promise<SerializeDatesDeep<ISegment[]>> =>
    app.request
        .get(`${SEGMENTS_BASE_PATH}/strategies/${strategyId}`)
        .expect(200)
        .then((res) => res.body.segments);

const fetchFeatures = (): Promise<IFeatureToggleClient[]> =>
    app.request
        .get(FEATURES_LIST_BASE_PATH)
        .expect(200)
        .then((res) => res.body.features);

const fetchSegmentStrategies = (
    segmentId: number,
): Promise<IFeatureStrategy[]> =>
    app.request
        .get(`${SEGMENTS_BASE_PATH}/${segmentId}/strategies`)
        .expect(200)
        .then((res) => res.body.strategies);

const createSegment = (
    postData: object,
    expectStatusCode = 201,
): Promise<unknown> =>
    app.request
        .post(SEGMENTS_BASE_PATH)
        .send(postData)
        .expect(expectStatusCode);

const updateSegment = (
    id: number,
    postData: object,
    expectStatusCode = 204,
): Promise<unknown> =>
    app.request
        .put(`${SEGMENTS_BASE_PATH}/${id}`)
        .send(postData)
        .expect(expectStatusCode);

const addSegmentsToStrategy = (
    segmentIds: number[],
    strategyId: string,
    expectStatusCode = 201,
): Promise<unknown> =>
    app.request
        .post(`${SEGMENTS_BASE_PATH}/strategies`)
        .set('Content-type', 'application/json')
        .send({
            strategyId,
            segmentIds,
            projectId: 'default',
            environmentId: 'default',
            additional: 'property',
        })
        .expect(expectStatusCode);

const mockFeatureToggle = () => ({
    name: randomId(),
    strategies: [{ name: 'flexibleRollout', constraints: [], parameters: {} }],
});

const validateSegment = (
    postData: object,
    expectStatusCode = 204,
): Promise<unknown> =>
    app.request
        .post(`${SEGMENTS_BASE_PATH}/validate`)
        .set('Content-type', 'application/json')
        .send(postData)
        .expect(expectStatusCode);

beforeAll(async () => {
    db = await dbInit('segments_api_serial', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
                anonymiseEventLog: true,
            },
        },
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

afterEach(async () => {
    await db.stores.segmentStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
});

test('should validate segments', async () => {
    await createSegment({ something: 'a' }, 400);
    await createSegment({ name: randomId(), something: 'b' }, 400);
    await createSegment({ name: randomId(), constraints: 'b' }, 400);
    await createSegment({ constraints: [] }, 400);
    await createSegment({ name: randomId(), constraints: [{}] }, 400);
    await createSegment({ name: randomId(), constraints: [] });
    await createSegment({ name: randomId(), description: '', constraints: [] });
});

test('should fail on missing properties', async () => {
    const res = await app.request
        .post(`${SEGMENTS_BASE_PATH}/strategies`)
        .set('Content-type', 'application/json')
        .send({
            projectId: 'default',
            environmentId: 'default',
            additional: 'property',
        });

    expect(res.status).toBe(400);
});

test('should create segments', async () => {
    await createSegment({ name: 'a', constraints: [] });
    await createSegment({ name: 'c', constraints: [] });
    await createSegment({ name: 'b', constraints: [] });

    const segments = await fetchSegments();
    expect(segments.map((s) => s.name)).toEqual(['a', 'b', 'c']);
});

test('should update segments', async () => {
    await createSegment({ name: 'a', constraints: [] });
    const [segmentA] = await fetchSegments();
    expect(segmentA.id).toBeGreaterThan(0);
    expect(segmentA.name).toEqual('a');
    expect(segmentA.createdAt).toBeDefined();
    expect(segmentA.constraints.length).toEqual(0);

    await updateSegment(segmentA.id, { ...segmentA, name: 'b' });

    const [segmentB] = await fetchSegments();
    expect(segmentB.id).toEqual(segmentA.id);
    expect(segmentB.name).toEqual('b');
    expect(segmentB.createdAt).toBeDefined();
    expect(segmentB.constraints.length).toEqual(0);
});

test('should update segment constraints', async () => {
    const constraintA = { contextName: 'a', operator: 'IN', values: ['x'] };
    const constraintB = { contextName: 'b', operator: 'IN', values: ['y'] };
    await createSegment({ name: 'a', constraints: [constraintA] });
    const [segmentA] = await fetchSegments();
    expect(segmentA.constraints).toEqual([constraintA]);

    await app.request
        .put(`${SEGMENTS_BASE_PATH}/${segmentA.id}`)
        .send({ ...segmentA, constraints: [constraintB, constraintA] })
        .expect(204);

    const [segmentB] = await fetchSegments();
    expect(segmentB.constraints).toEqual([constraintB, constraintA]);
});

test('should delete segments', async () => {
    await createSegment({ name: 'a', constraints: [] });
    const segments = await fetchSegments();
    expect(segments.length).toEqual(1);

    await app.request
        .delete(`${SEGMENTS_BASE_PATH}/${segments[0].id}`)
        .expect(204);

    expect((await fetchSegments()).length).toEqual(0);
});

test('should not delete segments used by strategies', async () => {
    await createSegment({ name: 'a', constraints: [] });
    const toggle = mockFeatureToggle();
    await createFeatureToggle(app, toggle);
    const [segment] = await fetchSegments();

    await addStrategyToFeatureEnv(
        app,
        { ...toggle.strategies[0] },
        'default',
        toggle.name,
    );
    const [feature] = await fetchFeatures();
    //@ts-ignore
    await addSegmentsToStrategy([segment.id], feature.strategies[0].id);
    const segments = await fetchSegments();
    expect(segments.length).toEqual(1);

    await app.request
        .delete(`${SEGMENTS_BASE_PATH}/${segments[0].id}`)
        .expect(409);

    expect((await fetchSegments()).length).toEqual(1);
});

test('should list strategies by segment', async () => {
    await createSegment({ name: 'S1', constraints: [] });
    await createSegment({ name: 'S2', constraints: [] });
    await createSegment({ name: 'S3', constraints: [] });
    const toggle1 = mockFeatureToggle();
    const toggle2 = mockFeatureToggle();
    const toggle3 = mockFeatureToggle();
    await createFeatureToggle(app, toggle1);
    await createFeatureToggle(app, toggle2);
    await createFeatureToggle(app, toggle3);

    await addStrategyToFeatureEnv(
        app,
        { ...toggle1.strategies[0] },
        'default',
        toggle1.name,
    );
    await addStrategyToFeatureEnv(
        app,
        { ...toggle1.strategies[0] },
        'default',
        toggle2.name,
    );
    await addStrategyToFeatureEnv(
        app,
        { ...toggle3.strategies[0] },
        'default',
        toggle3.name,
    );

    const [feature1, feature2, feature3] = await fetchFeatures();
    const [segment1, segment2, segment3] = await fetchSegments();

    await addSegmentsToStrategy(
        [segment1.id, segment2.id, segment3.id],
        //@ts-ignore
        feature1.strategies[0].id,
    );
    await addSegmentsToStrategy(
        [segment2.id, segment3.id],
        //@ts-ignore
        feature2.strategies[0].id,
    );
    //@ts-ignore
    await addSegmentsToStrategy([segment3.id], feature3.strategies[0].id);

    const segmentStrategies1 = await fetchSegmentStrategies(segment1.id);
    const segmentStrategies2 = await fetchSegmentStrategies(segment2.id);
    const segmentStrategies3 = await fetchSegmentStrategies(segment3.id);

    expect(collectIds(segmentStrategies1)).toEqual(
        collectIds(feature1.strategies),
    );

    expect(collectIds(segmentStrategies2)).toEqual(
        collectIds([...feature1.strategies, ...feature2.strategies]),
    );

    expect(collectIds(segmentStrategies3)).toEqual(
        collectIds([
            ...feature1.strategies,
            ...feature2.strategies,
            ...feature3.strategies,
        ]),
    );
});

test('should list segments by strategy', async () => {
    await createSegment({ name: 'S1', constraints: [] });
    await createSegment({ name: 'S2', constraints: [] });
    await createSegment({ name: 'S3', constraints: [] });
    const toggle1 = mockFeatureToggle();
    const toggle2 = mockFeatureToggle();
    const toggle3 = mockFeatureToggle();
    await createFeatureToggle(app, toggle1);
    await createFeatureToggle(app, toggle2);
    await createFeatureToggle(app, toggle3);

    await addStrategyToFeatureEnv(
        app,
        { ...toggle1.strategies[0] },
        'default',
        toggle1.name,
    );
    await addStrategyToFeatureEnv(
        app,
        { ...toggle1.strategies[0] },
        'default',
        toggle2.name,
    );
    await addStrategyToFeatureEnv(
        app,
        { ...toggle3.strategies[0] },
        'default',
        toggle3.name,
    );

    const [feature1, feature2, feature3] = await fetchFeatures();
    const [segment1, segment2, segment3] = await fetchSegments();

    await addSegmentsToStrategy(
        [segment1.id, segment2.id, segment3.id],
        //@ts-ignore
        feature1.strategies[0].id,
    );
    await addSegmentsToStrategy(
        [segment2.id, segment3.id],
        //@ts-ignore
        feature2.strategies[0].id,
    );
    //@ts-ignore
    await addSegmentsToStrategy([segment3.id], feature3.strategies[0].id);

    const strategySegments1 = await fetchSegmentsByStrategy(
        //@ts-ignore
        feature1.strategies[0].id,
    );
    const strategySegments2 = await fetchSegmentsByStrategy(
        //@ts-ignore
        feature2.strategies[0].id,
    );
    const strategySegments3 = await fetchSegmentsByStrategy(
        //@ts-ignore
        feature3.strategies[0].id,
    );

    expect(collectIds(strategySegments1)).toEqual(
        collectIds([segment1, segment2, segment3]),
    );

    expect(collectIds(strategySegments2)).toEqual(
        collectIds([segment2, segment3]),
    );

    expect(collectIds(strategySegments3)).toEqual(collectIds([segment3]));
});

test('should reject duplicate segment names', async () => {
    await validateSegment({ name: 'a' });
    await createSegment({ name: 'a', constraints: [] });
    await validateSegment({ name: 'a' }, 409);
    await validateSegment({ name: 'b' });
});

test('should reject empty segment names', async () => {
    await validateSegment({ name: 'a' });
    await validateSegment({}, 400);
    await validateSegment({ name: '' }, 400);
});

test('should reject duplicate segment names on create', async () => {
    await createSegment({ name: 'a', constraints: [] });
    await createSegment({ name: 'a', constraints: [] }, 409);
    await validateSegment({ name: 'b' });
});

test('should reject duplicate segment names on update', async () => {
    await createSegment({ name: 'a', constraints: [] });
    await createSegment({ name: 'b', constraints: [] });
    const [segmentA, segmentB] = await fetchSegments();
    await updateSegment(segmentA.id, { name: 'b', constraints: [] }, 409);
    await updateSegment(segmentB.id, { name: 'a', constraints: [] }, 409);
    await updateSegment(segmentA.id, { name: 'a', constraints: [] });
    await updateSegment(segmentA.id, { name: 'c', constraints: [] });
});

test('Should anonymise createdBy field if anonymiseEventLog flag is set', async () => {
    await createSegment({ name: 'a', constraints: [] });
    await createSegment({ name: 'b', constraints: [] });
    const segments = await fetchSegments();
    expect(segments).toHaveLength(2);
    expect(segments[0].createdBy).toContain('unleash.run');
});

test('Should show usage in features and projects', async () => {
    await createSegment({ name: 'a', constraints: [] });
    const toggle = mockFeatureToggle();
    await createFeatureToggle(app, toggle);
    const [segment] = await fetchSegments();
    await addStrategyToFeatureEnv(
        app,
        { ...toggle.strategies[0] },
        'default',
        toggle.name,
    );
    const [feature] = await fetchFeatures();
    //@ts-ignore
    await addSegmentsToStrategy([segment.id], feature.strategies[0].id);

    const segments = await fetchSegments();
    expect(segments).toMatchObject([{ usedInFeatures: 1, usedInProjects: 1 }]);
});
