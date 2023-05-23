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
import {
    DEFAULT_SEGMENT_VALUES_LIMIT,
    DEFAULT_STRATEGY_SEGMENTS_LIMIT,
} from '../../../../lib/util/segments';
import { collectIds } from '../../../../lib/util/collect-ids';
import { arraysHaveSameItems } from '../../../../lib/util/arraysHaveSameItems';
import {
    CreateFeatureSchema,
    CreateFeatureStrategySchema,
    FeatureStrategySchema,
    UpsertSegmentSchema,
} from 'lib/openapi';
import { DEFAULT_ENV } from '../../../../lib/util';
import { DEFAULT_PROJECT } from '../../../../lib/types';

let db: ITestDb;
let app: IUnleashTest;

const FEATURES_CLIENT_BASE_PATH = '/api/client/features';

const fetchSegments = (): Promise<ISegment[]> => {
    return app.services.segmentService.getAll();
};

const fetchFeatures = (): Promise<IFeatureToggleClient[]> => {
    return app.request
        .get(`/api/admin/features`)
        .expect(200)
        .then((res) => res.body.features);
};

const fetchClientFeatures = (): Promise<IFeatureToggleClient[]> => {
    return app.request
        .get(FEATURES_CLIENT_BASE_PATH)
        .expect(200)
        .then((res) => res.body.features);
};

const createSegment = (postData: UpsertSegmentSchema): Promise<ISegment> => {
    return app.services.segmentService.create(postData, {
        email: 'test@example.com',
    });
};

const updateSegment = (
    id: number,
    postData: UpsertSegmentSchema,
): Promise<void> => {
    return app.services.segmentService.update(id, postData, {
        email: 'test@example.com',
    });
};

const mockStrategy = (segments: number[] = []) => {
    return {
        name: randomId(),
        parameters: {},
        constraints: [],
        segments,
    };
};

const createProjects = async (projects: string[] = [DEFAULT_PROJECT]) => {
    for (const project of projects) {
        await db.stores.projectStore.create({
            name: project,
            description: '',
            id: project,
            mode: 'open' as const,
        });
        await app.request
            .post(`/api/admin/projects/${project}/environments`)
            .send({
                environment: DEFAULT_ENV,
            })
            .expect(200);
    }
};

const createFeatureToggle = async (
    feature: CreateFeatureSchema,
    strategies: CreateFeatureStrategySchema[] = [mockStrategy()],
    project = DEFAULT_PROJECT,
    environment = DEFAULT_ENV,
    expectStatusCode = 201,
    expectSegmentStatusCodes: { status: number; message?: string }[] = [
        { status: 200 },
    ],
): Promise<void> => {
    await app.createFeature(feature, project, expectStatusCode);
    let processed = 0;
    for (const strategy of strategies) {
        const { body, status } = await app.request
            .post(
                `/api/admin/projects/${project}/features/${feature.name}/environments/${environment}/strategies`,
            )
            .send(strategy);
        const expectation = expectSegmentStatusCodes[processed++];
        expect(status).toBe(expectation.status);
        if (expectation.message) {
            expect(JSON.stringify(body)).toContain(expectation.message);
        }
    }
};

const updateFeatureStrategy = async (
    featureName: string,
    strategy: FeatureStrategySchema,
    project = DEFAULT_PROJECT,
    environment = DEFAULT_ENV,
    expectedStatus = 200,
): Promise<void> => {
    const { status } = await app.request
        .put(
            `/api/admin/projects/${project}/features/${featureName}/environments/${environment}/strategies/${strategy.id}`,
        )
        .send(strategy);
    expect(status).toBe(expectedStatus);
};

const mockFeatureToggle = () => {
    return {
        name: randomId(),
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

    const segment1 = await createSegment({ name: 'S1', constraints });
    const segment2 = await createSegment({ name: 'S2', constraints });
    const segment3 = await createSegment({ name: 'S3', constraints });

    await createFeatureToggle(mockFeatureToggle(), [
        mockStrategy([segment1.id, segment2.id]),
    ]);
    await createFeatureToggle(mockFeatureToggle(), [
        mockStrategy([segment2.id]),
    ]);
    await createFeatureToggle(mockFeatureToggle());

    return [segment1, segment2, segment3];
};

beforeAll(async () => {
    db = await dbInit('segments', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {}, db.rawDatabase);
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
    const segments: ISegment[] = [];
    for (const id of [1, 2, 3, 4, 5, 6]) {
        segments.push(await createSegment({ name: `S${id}`, constraints: [] }));
    }

    await createFeatureToggle(
        mockFeatureToggle(),
        [mockStrategy(segments.map((s) => s.id))],
        DEFAULT_PROJECT,
        DEFAULT_ENV,
        201,
        [
            {
                status: 400,
                message: `Strategies may not have more than ${DEFAULT_STRATEGY_SEGMENTS_LIMIT} segments`,
            },
        ],
    );
});

test('should clone feature strategy segments', async () => {
    const constraints = mockConstraints();
    const segment1 = await createSegment({ name: 'S1', constraints });
    await createFeatureToggle(mockFeatureToggle(), [
        mockStrategy([segment1.id]),
    ]);
    await createFeatureToggle(mockFeatureToggle());

    const [feature1, feature2] = await fetchFeatures();
    const strategy1 = feature1.strategies[0].id;
    const strategy2 = feature2.strategies[0].id;

    let segments1 = await app.services.segmentService.getByStrategy(strategy1!);
    let segments2 = await app.services.segmentService.getByStrategy(strategy2!);
    expect(collectIds(segments1)).toEqual([segment1.id]);
    expect(collectIds(segments2)).toEqual([]);

    await app.services.segmentService.cloneStrategySegments(
        strategy1!,
        strategy2!,
    );

    segments1 = await app.services.segmentService.getByStrategy(strategy1!);
    segments2 = await app.services.segmentService.getByStrategy(strategy2!);
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

    // add segment3 to all features
    for (const feature of [feature1, feature2, feature3]) {
        const strategy = {
            ...feature.strategies[0],
            segments: feature.strategies[0].segments ?? [],
        };
        await updateFeatureStrategy(feature.name, {
            ...strategy,
            segments: [...strategy.segments, segment3.id],
        });
    }

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

describe('project-specific segments', () => {
    test(`can create a toggle with a project-specific segment`, async () => {
        const segmentName = 'my-segment';
        const project = randomId();
        await createProjects([project]);
        const segment = await createSegment({
            name: segmentName,
            project,
            constraints: [],
        });
        const strategy = {
            name: 'default',
            parameters: {},
            constraints: [],
            segments: [segment.id],
        };
        await createFeatureToggle(
            {
                name: 'first_feature',
                description: 'the #1 feature',
            },
            [strategy],
            project,
        );
    });

    test(`can't create a toggle with a segment from a different project`, async () => {
        const segmentName = 'my-segment';
        const project1 = randomId();
        const project2 = randomId();
        await createProjects([project1, project2]);
        const segment = await createSegment({
            name: segmentName,
            project: project1,
            constraints: [],
        });
        const strategy = {
            name: 'default',
            parameters: {},
            constraints: [],
            segments: [segment.id],
        };
        await createFeatureToggle(
            {
                name: 'first_feature',
                description: 'the #1 feature',
            },
            [strategy],
            project2,
            DEFAULT_ENV,
            201,
            [{ status: 400 }],
        );
    });

    test(`can't set a different segment project when being used by another project`, async () => {
        const segmentName = 'my-segment';
        const project1 = randomId();
        const project2 = randomId();
        await createProjects([project1, project2]);
        const segment = await createSegment({
            name: segmentName,
            project: project1,
            constraints: [],
        });
        const strategy = {
            name: 'default',
            parameters: {},
            constraints: [],
            segments: [segment.id],
        };
        await createFeatureToggle(
            {
                name: 'first_feature',
                description: 'the #1 feature',
            },
            [strategy],
            project1,
        );
        await expect(() =>
            updateSegment(segment.id, {
                ...segment,
                project: project2,
            }),
        ).rejects.toThrow(
            `Invalid project. Segment is being used by strategies in other projects: ${project1}`,
        );
    });

    test('can promote a segment project to global even when being used by a specific project', async () => {
        const segmentName = 'my-segment';
        const project1 = randomId();
        const project2 = randomId();
        await createProjects([project1, project2]);
        const segment = await createSegment({
            name: segmentName,
            project: project1,
            constraints: [],
        });
        const strategy = {
            name: 'default',
            parameters: {},
            constraints: [],
            segments: [segment.id],
        };
        await createFeatureToggle(
            {
                name: 'first_feature',
                description: 'the #1 feature',
            },
            [strategy],
            project1,
        );
        await expect(() =>
            updateSegment(segment.id, {
                ...segment,
                project: '',
            }),
        ).resolves;
    });

    test(`can't set a specific segment project when being used by multiple projects (global)`, async () => {
        const segmentName = 'my-segment';
        const project1 = randomId();
        const project2 = randomId();
        await createProjects([project1, project2]);
        const segment = await createSegment({
            name: segmentName,
            project: '',
            constraints: [],
        });
        const strategy = {
            name: 'default',
            parameters: {},
            constraints: [],
            segments: [segment.id],
        };
        const strategy2 = {
            name: 'default',
            parameters: {},
            constraints: [],
            segments: [segment.id],
        };
        await createFeatureToggle(
            {
                name: 'first_feature',
                description: 'the #1 feature',
            },
            [strategy],
            project1,
        );
        await createFeatureToggle(
            {
                name: 'second_feature',
                description: 'the #2 feature',
            },
            [strategy2],
            project2,
        );
        await expect(() =>
            updateSegment(segment.id, {
                ...segment,
                project: project1,
            }),
        ).rejects.toThrow(
            `Invalid project. Segment is being used by strategies in other projects: ${project1}, ${project2}`,
        );
    });
});
