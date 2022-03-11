import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { IUnleashTest, setupApp } from '../../helpers/test-helper';
import { collectIds } from '../../../../lib/util/collect-ids';
import {
    IConstraint,
    IFeatureToggleClient,
    ISegment,
} from '../../../../lib/types/model';
import { randomId } from '../../../../lib/util/random-id';
import User from '../../../../lib/types/user';

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

const fetchClientSegmentsActive = (): Promise<ISegment[]> => {
    return app.request
        .get('/api/client/segments/active')
        .expect(200)
        .then((res) => res.body.segments);
};

const createSegment = (postData: object): Promise<unknown> => {
    const user = { email: 'test@example.com' } as User;
    return app.services.segmentService.create(postData, user);
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
});

test('should add segments to features as constraints', async () => {
    const constraints = mockConstraints();
    await createSegment({ name: 'S1', constraints });
    await createSegment({ name: 'S2', constraints });
    await createSegment({ name: 'S3', constraints });
    await createFeatureToggle(mockFeatureToggle());
    await createFeatureToggle(mockFeatureToggle());
    await createFeatureToggle(mockFeatureToggle());
    const [feature1, feature2, feature3] = await fetchFeatures();
    const [segment1, segment2, segment3] = await fetchSegments();

    await addSegmentToStrategy(segment1.id, feature1.strategies[0].id);
    await addSegmentToStrategy(segment2.id, feature1.strategies[0].id);
    await addSegmentToStrategy(segment2.id, feature2.strategies[0].id);
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

test('should list active segments', async () => {
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

    const clientSegments = await fetchClientSegmentsActive();

    expect(collectIds(clientSegments)).toEqual(
        collectIds([segment1, segment2]),
    );
});
