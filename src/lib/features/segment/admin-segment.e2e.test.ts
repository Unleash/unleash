import { randomId } from '../../util/random-id.js';
import type { ISegment } from '../../types/model.js';
import { collectIds } from '../../util/collect-ids.js';
import { vi } from 'vitest';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import {
    addStrategyToFeatureEnv,
    createFeatureFlag,
} from '../../../test/e2e/helpers/app.utils.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import type { StrategiesUsingSegment } from './segment-service-interface.js';
import type { IFeatureOverview, IUser } from '../../types/index.js';
import { DEFAULT_ENV } from '../../server-impl.js';

let app: IUnleashTest;
let db: ITestDb;

const SEGMENTS_BASE_PATH = '/api/admin/segments';
const FEATURES_LIST_BASE_PATH = '/api/admin/projects/default/features';

const getFeatureStrategiesPath = (featureName: string) => {
    return `/api/admin/projects/default/features/${featureName}/environments/${DEFAULT_ENV}/strategies`;
};

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

const fetchFeatures = (): Promise<IFeatureOverview[]> =>
    app.request
        .get(FEATURES_LIST_BASE_PATH)
        .expect(200)
        .then((res) => res.body.features);

const fetchFeatureStrategies = (featureName: string) =>
    app.request
        .get(getFeatureStrategiesPath(featureName))
        .expect(200)
        .then((res) => res.body);

const fetchSegmentStrategies = (
    segmentId: number,
): Promise<StrategiesUsingSegment> =>
    app.request
        .get(`${SEGMENTS_BASE_PATH}/${segmentId}/strategies`)
        .expect(200)
        .then((res) => res.body);

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
            environmentId: DEFAULT_ENV,
            additional: 'property',
        })
        .expect(expectStatusCode);

const mockFeatureFlag = () => ({
    name: randomId(),
    strategies: [
        {
            name: 'flexibleRollout',
            constraints: [],
            parameters: {},
        },
    ],
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
    const customOptions = {
        experimental: {
            flags: {
                anonymiseEventLog: true,
            },
        },
    };

    db = await dbInit('segments_api_serial', getLogger, customOptions);
    app = await setupAppWithCustomConfig(
        db.stores,
        customOptions,
        db.rawDatabase,
    );
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
    await app.createSegment({ something: 'a' }, 400);
    await app.createSegment(
        {
            name: randomId(),
            something: 'b',
        },
        400,
    );
    await app.createSegment(
        {
            name: randomId(),
            constraints: 'b',
        },
        400,
    );
    await app.createSegment({ constraints: [] }, 400);
    await app.createSegment(
        {
            name: randomId(),
            constraints: [{}],
        },
        400,
    );
    await app.createSegment({
        name: randomId(),
        constraints: [],
    });
    await app.createSegment({
        name: randomId(),
        description: '',
        constraints: [],
    });
});

test('should fail on missing properties', async () => {
    const res = await app.request
        .post(`${SEGMENTS_BASE_PATH}/strategies`)
        .set('Content-type', 'application/json')
        .send({
            projectId: 'default',
            environmentId: DEFAULT_ENV,
            additional: 'property',
        });

    expect(res.status).toBe(400);
});

test('should return 403 when user lacks permission to update strategy segments', async () => {
    await app.createSegment({
        name: 'S1',
        constraints: [],
    });
    const flag = mockFeatureFlag();
    await createFeatureFlag(app, flag);
    const [segment] = await fetchSegments();

    await addStrategyToFeatureEnv(
        app,
        { ...flag.strategies[0] },
        DEFAULT_ENV,
        flag.name,
    );
    const [feature] = await fetchFeatures();
    const [strategy] = await fetchFeatureStrategies(feature.name);

    const hasPermissionSpy = vi
        .spyOn(app.services.accessService, 'hasPermission')
        .mockResolvedValueOnce(false);

    await addSegmentsToStrategy([segment.id], strategy.id, 403);

    expect(hasPermissionSpy).toHaveBeenCalledTimes(1);
});

test('should create segments', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    await app.createSegment({
        name: 'c',
        constraints: [],
    });
    await app.createSegment({
        name: 'b',
        constraints: [],
    });

    const segments = await fetchSegments();
    expect(segments.map((s) => s.name)).toEqual(['a', 'b', 'c']);
});

test('should return 400 for non numeric segment ID', async () => {
    await app.request.get(`${SEGMENTS_BASE_PATH}/stringName`).expect(400);
});

test('should update segments', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    const [segmentA] = await fetchSegments();
    expect(segmentA.id).toBeGreaterThan(0);
    expect(segmentA.name).toEqual('a');
    expect(segmentA.createdAt).toBeDefined();
    expect(segmentA.constraints.length).toEqual(0);

    await updateSegment(segmentA.id, {
        ...segmentA,
        name: 'b',
    });

    const [segmentB] = await fetchSegments();
    expect(segmentB.id).toEqual(segmentA.id);
    expect(segmentB.name).toEqual('b');
    expect(segmentB.createdAt).toBeDefined();
    expect(segmentB.constraints.length).toEqual(0);
});

test('should update segment constraints', async () => {
    const constraintA = {
        contextName: 'a',
        operator: 'IN',
        values: ['x'],
    };
    const constraintB = {
        contextName: 'b',
        operator: 'IN',
        values: ['y'],
    };
    await app.createSegment({
        name: 'a',
        constraints: [constraintA],
    });
    const [segmentA] = await fetchSegments();
    expect(segmentA.constraints).toEqual([constraintA]);

    await app.request
        .put(`${SEGMENTS_BASE_PATH}/${segmentA.id}`)
        .send({
            ...segmentA,
            constraints: [constraintB, constraintA],
        })
        .expect(204);

    const [segmentB] = await fetchSegments();
    expect(segmentB.constraints).toEqual([constraintB, constraintA]);
});

test('should delete segments', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    const segments = await fetchSegments();
    expect(segments.length).toEqual(1);

    await app.request
        .delete(`${SEGMENTS_BASE_PATH}/${segments[0].id}`)
        .expect(204);

    expect((await fetchSegments()).length).toEqual(0);
});

test('should not delete segments used by strategies', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    const flag = mockFeatureFlag();
    await createFeatureFlag(app, flag);
    const [segment] = await fetchSegments();

    await addStrategyToFeatureEnv(
        app,
        { ...flag.strategies[0] },
        DEFAULT_ENV,
        flag.name,
    );
    const [feature] = await fetchFeatures();
    const [strategy] = await fetchFeatureStrategies(feature.name);
    await addSegmentsToStrategy([segment.id], strategy.id);
    const segments = await fetchSegments();
    expect(segments.length).toEqual(1);

    await app.request
        .delete(`${SEGMENTS_BASE_PATH}/${segments[0].id}`)
        .expect(409);

    expect((await fetchSegments()).length).toEqual(1);
});

test('should delete segments used by strategies in archived feature flags', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    const flag = mockFeatureFlag();
    await createFeatureFlag(app, flag);
    const [segment] = await fetchSegments();

    await addStrategyToFeatureEnv(
        app,
        { ...flag.strategies[0] },
        DEFAULT_ENV,
        flag.name,
    );
    const [feature] = await fetchFeatures();
    const [strategy] = await fetchFeatureStrategies(feature.name);
    await addSegmentsToStrategy([segment.id], strategy.id);
    const segments = await fetchSegments();
    expect(segments.length).toEqual(1);

    await app.archiveFeature(feature.name);

    await app.request
        .delete(`${SEGMENTS_BASE_PATH}/${segments[0].id}`)
        .expect(204);

    expect((await fetchSegments()).length).toEqual(0);
});

test('should list strategies by segment', async () => {
    await app.createSegment({
        name: 'S1',
        constraints: [],
    });
    await app.createSegment({
        name: 'S2',
        constraints: [],
    });
    await app.createSegment({
        name: 'S3',
        constraints: [],
    });
    const flag1 = mockFeatureFlag();
    const flag2 = mockFeatureFlag();
    const flag3 = mockFeatureFlag();
    await createFeatureFlag(app, flag1);
    await createFeatureFlag(app, flag2);
    await createFeatureFlag(app, flag3);

    await addStrategyToFeatureEnv(
        app,
        { ...flag1.strategies[0] },
        DEFAULT_ENV,
        flag1.name,
    );
    await addStrategyToFeatureEnv(
        app,
        { ...flag1.strategies[0] },
        DEFAULT_ENV,
        flag2.name,
    );
    await addStrategyToFeatureEnv(
        app,
        { ...flag3.strategies[0] },
        DEFAULT_ENV,
        flag3.name,
    );

    const [feature1, feature2, feature3] = await fetchFeatures();
    const [segment1, segment2, segment3] = await fetchSegments();

    const feature1Strategies = await fetchFeatureStrategies(feature1.name);
    const feature2Strategies = await fetchFeatureStrategies(feature2.name);
    const feature3Strategies = await fetchFeatureStrategies(feature3.name);

    await addSegmentsToStrategy(
        [segment1.id, segment2.id, segment3.id],
        feature1Strategies[0].id,
    );
    await addSegmentsToStrategy(
        [segment2.id, segment3.id],
        feature2Strategies[0].id,
    );
    await addSegmentsToStrategy([segment3.id], feature3Strategies[0].id);

    const segmentStrategies1 = await fetchSegmentStrategies(segment1.id);
    const segmentStrategies2 = await fetchSegmentStrategies(segment2.id);
    const segmentStrategies3 = await fetchSegmentStrategies(segment3.id);

    expect(collectIds(segmentStrategies1.strategies)).toEqual(
        collectIds(feature1Strategies),
    );

    expect(collectIds(segmentStrategies2.strategies)).toEqual(
        collectIds([...feature1Strategies, ...feature2Strategies]),
    );

    expect(collectIds(segmentStrategies3.strategies)).toEqual(
        collectIds([
            ...feature1Strategies,
            ...feature2Strategies,
            ...feature3Strategies,
        ]),
    );
});

test('should list segments by strategy', async () => {
    await app.createSegment({
        name: 'S1',
        constraints: [],
    });
    await app.createSegment({
        name: 'S2',
        constraints: [],
    });
    await app.createSegment({
        name: 'S3',
        constraints: [],
    });
    const flag1 = mockFeatureFlag();
    const flag2 = mockFeatureFlag();
    const flag3 = mockFeatureFlag();
    await createFeatureFlag(app, flag1);
    await createFeatureFlag(app, flag2);
    await createFeatureFlag(app, flag3);

    await addStrategyToFeatureEnv(
        app,
        { ...flag1.strategies[0] },
        DEFAULT_ENV,
        flag1.name,
    );
    await addStrategyToFeatureEnv(
        app,
        { ...flag1.strategies[0] },
        DEFAULT_ENV,
        flag2.name,
    );
    await addStrategyToFeatureEnv(
        app,
        { ...flag3.strategies[0] },
        DEFAULT_ENV,
        flag3.name,
    );

    const [feature1, feature2, feature3] = await fetchFeatures();
    const [segment1, segment2, segment3] = await fetchSegments();

    const [feature1Strategy] = await fetchFeatureStrategies(feature1.name);
    const [feature2Strategy] = await fetchFeatureStrategies(feature2.name);
    const [feature3Strategy] = await fetchFeatureStrategies(feature3.name);

    await addSegmentsToStrategy(
        [segment1.id, segment2.id, segment3.id],
        feature1Strategy.id,
    );
    await addSegmentsToStrategy(
        [segment2.id, segment3.id],
        feature2Strategy.id,
    );
    await addSegmentsToStrategy([segment3.id], feature3Strategy.id);

    const strategySegments1 = await fetchSegmentsByStrategy(
        feature1Strategy.id,
    );
    const strategySegments2 = await fetchSegmentsByStrategy(
        feature2Strategy.id,
    );
    const strategySegments3 = await fetchSegmentsByStrategy(
        feature3Strategy.id,
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
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    await validateSegment({ name: 'a' }, 409);
    await validateSegment({ name: 'b' });
});

test('should reject empty segment names', async () => {
    await validateSegment({ name: 'a' });
    await validateSegment({}, 400);
    await validateSegment({ name: '' }, 400);
});

test('should reject duplicate segment names on create', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    await app.createSegment(
        {
            name: 'a',
            constraints: [],
        },
        409,
    );
    await validateSegment({ name: 'b' });
});

test('should reject duplicate segment names on update', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    await app.createSegment({
        name: 'b',
        constraints: [],
    });
    const [segmentA, segmentB] = await fetchSegments();
    await updateSegment(
        segmentA.id,
        {
            name: 'b',
            constraints: [],
        },
        409,
    );
    await updateSegment(
        segmentB.id,
        {
            name: 'a',
            constraints: [],
        },
        409,
    );
    await updateSegment(segmentA.id, {
        name: 'a',
        constraints: [],
    });
    await updateSegment(segmentA.id, {
        name: 'c',
        constraints: [],
    });
});

test('Should anonymise createdBy field if anonymiseEventLog flag is set', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    await app.createSegment({
        name: 'b',
        constraints: [],
    });
    const segments = await fetchSegments();
    expect(segments).toHaveLength(2);
    expect(segments[0].createdBy).toContain('unleash.run');
});

test('Should show usage in features and projects', async () => {
    await app.createSegment({
        name: 'a',
        constraints: [],
    });
    const flag = mockFeatureFlag();
    await createFeatureFlag(app, flag);
    const [segment] = await fetchSegments();
    await addStrategyToFeatureEnv(
        app,
        { ...flag.strategies[0] },
        DEFAULT_ENV,
        flag.name,
    );
    const [feature] = await fetchFeatures();
    const [strategy] = await fetchFeatureStrategies(feature.name);

    const unusedSegments = await fetchSegments();
    expect(unusedSegments).toMatchObject([
        {
            usedInFeatures: 0,
            usedInProjects: 0,
        },
    ]);

    await addSegmentsToStrategy([segment.id], strategy.id);
    const usedSegments = await fetchSegments();
    expect(usedSegments).toMatchObject([
        {
            usedInFeatures: 1,
            usedInProjects: 1,
        },
    ]);

    await app.archiveFeature(feature.name, feature.project);
    const segmentsWithArchivedFeatures = await fetchSegments();
    expect(segmentsWithArchivedFeatures).toMatchObject([
        {
            usedInFeatures: 0,
            usedInProjects: 0,
        },
    ]);
});

describe('detect strategy usage in change requests', () => {
    const CR_TITLE = 'My change request';
    const CR_ID = 54321;
    let user: IUser;

    // Change request data is only counted for enterprise
    // instances, so we'll instantiate our own version of the app
    // for that.
    let enterpriseApp: IUnleashTest;

    // likewise, we want to fetch from the right app to make sure
    // we get the right data
    const enterpriseFetchSegments = () =>
        enterpriseApp.request
            .get(SEGMENTS_BASE_PATH)
            .expect(200)
            .then((res) => res.body.segments);

    const enterpriseFetchSegmentStrategies = (
        segmentId: number,
    ): Promise<StrategiesUsingSegment> =>
        enterpriseApp.request
            .get(`${SEGMENTS_BASE_PATH}/${segmentId}/strategies`)
            .expect(200)
            .then((res) => res.body);

    beforeAll(async () => {
        enterpriseApp = await setupAppWithCustomConfig(
            db.stores,
            {
                enterpriseVersion: '5.3.0',
                ui: { environment: 'Enterprise' },
                isEnterprise: true,
                experimental: {
                    flags: {},
                },
            },
            db.rawDatabase,
        );

        user = await db.stores.userStore.insert({
            username: 'test',
        });

        await db.rawDatabase.table('change_requests').insert({
            id: CR_ID,
            environment: DEFAULT_ENV,
            state: 'In review',
            project: 'default',
            created_by: user.id,
            created_at: '2023-01-01 00:00:00',
            min_approvals: 1,
            title: CR_TITLE,
        });
    });
    afterAll(async () => {
        await db.stores.userStore.delete(user.id);
        await db.rawDatabase.table('change_requests').delete();
    });

    afterEach(async () => {
        await db.rawDatabase.table('change_request_events').delete();
    });

    test('should not delete segments used by strategies in CRs', async () => {
        await app.createSegment({
            name: 'a',
            constraints: [],
        });
        const flag = mockFeatureFlag();
        await createFeatureFlag(enterpriseApp, flag);
        const [segment] = await enterpriseFetchSegments();

        await db.rawDatabase.table('change_request_events').insert({
            feature: flag.name,
            action: 'addStrategy',
            payload: {
                name: 'flexibleRollout',
                title: '',
                disabled: false,
                segments: [segment.id],
                variants: [],
                parameters: {
                    groupId: flag.name,
                    rollout: '100',
                    stickiness: 'default',
                },
                constraints: [],
            },
            created_at: '2023-01-01 00:01:00',
            change_request_id: CR_ID,
            created_by: user.id,
        });

        expect((await enterpriseFetchSegments()).length).toEqual(1);

        await enterpriseApp.request
            .delete(`${SEGMENTS_BASE_PATH}/${segment.id}`)
            .expect(409);

        expect((await enterpriseFetchSegments()).length).toEqual(1);

        // check that it can be deleted in OSS
        await app.request
            .delete(`${SEGMENTS_BASE_PATH}/${segment.id}`)
            .expect(204);
    });

    test('Should show segment usage in addStrategy events', async () => {
        await app.createSegment({
            name: 'a',
            constraints: [],
        });
        const flag = mockFeatureFlag();
        await createFeatureFlag(enterpriseApp, flag);
        const [segment] = await enterpriseFetchSegments();

        await db.rawDatabase.table('change_request_events').insert({
            feature: flag.name,
            action: 'addStrategy',
            payload: {
                name: 'flexibleRollout',
                title: '',
                disabled: false,
                segments: [segment.id],
                variants: [],
                parameters: {
                    groupId: flag.name,
                    rollout: '100',
                    stickiness: 'default',
                },
                constraints: [],
            },
            created_at: '2023-01-01 00:01:00',
            change_request_id: CR_ID,
            created_by: user.id,
        });

        const { strategies, changeRequestStrategies } =
            await enterpriseFetchSegmentStrategies(segment.id);

        expect(changeRequestStrategies).toMatchObject([
            {
                environment: DEFAULT_ENV,
                featureName: flag.name,
                projectId: 'default',
                strategyName: 'flexibleRollout',
                changeRequest: { id: CR_ID, title: CR_TITLE },
            },
        ]);
        expect(strategies).toStrictEqual([]);

        // check that OSS gets no CR strategies
        const ossResult = await fetchSegmentStrategies(segment.id);
        expect(ossResult.strategies).toStrictEqual([]);
        expect(ossResult.changeRequestStrategies ?? []).toStrictEqual([]);
    });

    test('Should show segment usage in updateStrategy events', async () => {
        await app.createSegment({
            name: 'a',
            constraints: [],
        });
        const flag = mockFeatureFlag();
        await createFeatureFlag(enterpriseApp, flag);
        const [segment] = await enterpriseFetchSegments();

        await addStrategyToFeatureEnv(
            enterpriseApp,
            { ...flag.strategies[0] },
            DEFAULT_ENV,
            flag.name,
        );

        const [feature] = await fetchFeatures();
        const [strategy] = await fetchFeatureStrategies(feature.name);

        const strategyId = strategy.id;

        await db.rawDatabase.table('change_request_events').insert({
            feature: flag.name,
            action: 'updateStrategy',
            payload: {
                id: strategyId,
                name: 'flexibleRollout',
                title: '',
                disabled: false,
                segments: [segment.id],
                variants: [],
                parameters: {
                    groupId: flag.name,
                    rollout: '100',
                    stickiness: 'default',
                },
                constraints: [],
            },
            created_at: '2023-01-01 00:01:00',
            change_request_id: CR_ID,
            created_by: user.id,
        });

        const { strategies, changeRequestStrategies } =
            await enterpriseFetchSegmentStrategies(segment.id);

        expect(changeRequestStrategies).toMatchObject([
            {
                id: strategyId,
                changeRequest: { id: CR_ID, title: CR_TITLE },
            },
        ]);
        expect(strategies).toStrictEqual([]);

        // check that OSS gets no CR strategies
        const ossResult = await fetchSegmentStrategies(segment.id);
        expect(ossResult.strategies).toStrictEqual([]);
        expect(ossResult.changeRequestStrategies ?? []).toStrictEqual([]);
    });

    test('If a segment is used in an existing strategy and in a CR for the same strategy, the strategy should be listed both places', async () => {
        await app.createSegment({
            name: 'a',
            constraints: [],
        });
        const flag = mockFeatureFlag();
        await createFeatureFlag(enterpriseApp, flag);
        const [segment] = await enterpriseFetchSegments();

        await addStrategyToFeatureEnv(
            enterpriseApp,
            { ...flag.strategies[0] },
            DEFAULT_ENV,
            flag.name,
        );

        const [feature] = await fetchFeatures();
        const [strategy] = await fetchFeatureStrategies(feature.name);

        const strategyId = strategy.id;
        await addSegmentsToStrategy([segment.id], strategyId!);

        await db.rawDatabase.table('change_request_events').insert({
            feature: flag.name,
            action: 'updateStrategy',
            payload: {
                id: strategyId,
                name: 'flexibleRollout',
                title: '',
                disabled: false,
                segments: [segment.id],
                variants: [],
                parameters: {
                    groupId: flag.name,
                    rollout: '100',
                    stickiness: 'default',
                },
                constraints: [],
            },
            created_at: '2023-01-01 00:01:00',
            change_request_id: CR_ID,
            created_by: user.id,
        });

        const { strategies, changeRequestStrategies } =
            await enterpriseFetchSegmentStrategies(segment.id);

        expect(strategies).toMatchObject([{ id: strategyId }]);

        expect(changeRequestStrategies).toMatchObject([{ id: strategyId }]);

        // check that OSS gets no CR strategies
        const ossResult = await fetchSegmentStrategies(segment.id);
        expect(ossResult.strategies).toMatchObject([{ id: strategyId }]);
        expect(ossResult.changeRequestStrategies ?? []).toStrictEqual([]);
    });

    test('Should show usage in features and projects in CRs', async () => {
        // because they use the same db, we can use the regular app
        // (through `createSegment` and `createFeatureFlag`) to
        // create the segment and the flag
        await app.createSegment({ name: 'a', constraints: [] });
        const flag = mockFeatureFlag();
        await createFeatureFlag(app, flag);
        const [segment] = await enterpriseFetchSegments();

        expect(segment).toMatchObject({ usedInFeatures: 0, usedInProjects: 0 });

        await db.rawDatabase.table('change_request_events').insert({
            feature: flag.name,
            action: 'addStrategy',
            payload: {
                name: 'flexibleRollout',
                title: '',
                disabled: false,
                segments: [segment.id],
                variants: [],
                parameters: {
                    groupId: flag.name,
                    rollout: '100',
                    stickiness: 'default',
                },
                constraints: [],
            },
            created_at: '2023-01-01 00:01:00',
            change_request_id: CR_ID,
            created_by: user.id,
        });

        const segments = await enterpriseFetchSegments();
        expect(segments).toMatchObject([
            { usedInFeatures: 1, usedInProjects: 1 },
        ]);

        // check that OSS gets no CR usage
        const ossSegments = await fetchSegments();
        expect(ossSegments).toMatchObject([
            { usedInFeatures: 0, usedInProjects: 0 },
        ]);
    });

    test('If a segment is used in an archived feature it should be excluded from count - enterprise version', async () => {
        await app.createSegment({
            name: 'a',
            constraints: [],
        });
        const flag = mockFeatureFlag();
        await createFeatureFlag(enterpriseApp, flag);
        const [segment] = await enterpriseFetchSegments();

        await addStrategyToFeatureEnv(
            enterpriseApp,
            { ...flag.strategies[0] },
            DEFAULT_ENV,
            flag.name,
        );

        const [feature] = await fetchFeatures();
        const [strategy] = await fetchFeatureStrategies(feature.name);

        const strategyId = strategy.id;
        await addSegmentsToStrategy([segment.id], strategyId!);

        const segments = await enterpriseFetchSegments();
        expect(segments).toMatchObject([
            { usedInFeatures: 1, usedInProjects: 1 },
        ]);

        await enterpriseApp.archiveFeature(flag.name, 'default');

        const segmentsAfter = await enterpriseFetchSegments();
        expect(segmentsAfter).toMatchObject([
            { usedInFeatures: 0, usedInProjects: 0 },
        ]);
    });
});
