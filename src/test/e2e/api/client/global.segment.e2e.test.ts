import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
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

interface ApiResponse {
    features: IFeatureToggleClient[];
    version: number;
    segments: ISegment[];
}

const fetchSegments = (): Promise<ISegment[]> => {
    return app.services.segmentService.getAll();
};

const fetchFeatures = (): Promise<IFeatureToggleClient[]> => {
    return app.request
        .get(FEATURES_ADMIN_BASE_PATH)
        .expect(200)
        .then((res) => res.body.features);
};

const fetchClientResponse = (): Promise<ApiResponse> => {
    return app.request
        .get(FEATURES_CLIENT_BASE_PATH)
        .expect(200)
        .then((res) => res.body);
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

const createTestSegments = async (): Promise<void> => {
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
    const experimentalConfig = {
        segments: {
            enableSegmentsAdminApi: true,
            enableSegmentsClientApi: true,
            inlineSegmentConstraints: false,
        },
    };

    db = await dbInit('global_segments', getLogger, {
        experimental: experimentalConfig,
    });

    app = await setupAppWithCustomConfig(db.stores, {
        experimental: experimentalConfig,
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

test('should return segments in base of toggle response if inline is disabled', async () => {
    await createTestSegments();

    const clientFeatures = await fetchClientResponse();
    expect(clientFeatures.segments.length).toBeDefined();
});

test('should only send segments that are in use', async () => {
    await createTestSegments();

    const clientFeatures = await fetchClientResponse();
    //3 segments were created in createTestSegments, only 2 are in use
    expect(clientFeatures.segments.length).toEqual(2);
});

test('should send all segments that are in use by feature', async () => {
    await createTestSegments();

    const clientFeatures = await fetchClientResponse();
    const globalSegments = clientFeatures.segments;
    const globalSegmentIds = globalSegments.map((segment) => segment.id);
    const allSegmentIds = clientFeatures.features
        .map((feat) => feat.strategies.map((strategy) => strategy.segments))
        .flat()
        .flat()
        .filter((x) => !!x);
    const toggleSegmentIds = [...new Set(allSegmentIds)];

    expect(globalSegmentIds).toEqual(toggleSegmentIds);
});
