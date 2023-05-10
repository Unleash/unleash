import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import assert from 'assert';
import User from '../../../lib/types/user';
import { randomId } from '../../../lib/util/random-id';
import {
    IConstraint,
    IFeatureToggleClient,
    ISegment,
} from '../../../lib/types/model';
import { IUnleashTest, setupApp } from '../helpers/test-helper';
import { UpsertSegmentSchema } from 'lib/openapi';

interface ISeedSegmentSpec {
    featuresCount: number;
    segmentsPerFeature: number;
    constraintsPerSegment: number;
    valuesPerConstraint: number;
}

// The number of items to insert.
const seedSegmentSpec: ISeedSegmentSpec = {
    featuresCount: 100,
    segmentsPerFeature: 5,
    constraintsPerSegment: 1,
    valuesPerConstraint: 100,
};

// The database schema to populate.
const seedSchema = 'seed';

const fetchSegments = (app: IUnleashTest): Promise<ISegment[]> => {
    return app.services.segmentService.getAll();
};

const createSegment = (
    app: IUnleashTest,
    postData: UpsertSegmentSchema,
): Promise<unknown> => {
    const user = { email: 'test@example.com' } as User;
    return app.services.segmentService.create(postData, user);
};

const createFeatureToggle = (
    app: IUnleashTest,
    postData: object,
    expectStatusCode = 201,
): Promise<IFeatureToggleClient> => {
    return app.request
        .post('/api/admin/features')
        .send(postData)
        .expect(expectStatusCode)
        .then((res) => res.body);
};

const addSegmentToStrategy = (
    app: IUnleashTest,
    segmentId: number,
    strategyId: string,
): Promise<unknown> => {
    return app.services.segmentService.addToStrategy(segmentId, strategyId);
};

const mockFeatureToggle = (
    overrides?: Partial<IFeatureToggleClient>,
): Partial<IFeatureToggleClient> => {
    return {
        name: randomId(),
        strategies: [{ name: randomId(), constraints: [], parameters: {} }],
        ...overrides,
    };
};

const seedConstraints = (spec: ISeedSegmentSpec): IConstraint[] => {
    return Array.from({ length: spec.constraintsPerSegment }).map(() => ({
        values: Array.from({ length: spec.valuesPerConstraint }).map(() =>
            randomId().substring(0, 16),
        ),
        operator: 'IN',
        contextName: 'x',
    }));
};

const seedSegments = (spec: ISeedSegmentSpec): UpsertSegmentSchema[] => {
    return Array.from({ length: spec.segmentsPerFeature }).map((v, i) => {
        return {
            name: `${seedSchema}_segment_${i}`,
            constraints: seedConstraints(spec),
        };
    });
};

const seedFeatures = (
    spec: ISeedSegmentSpec,
): Partial<IFeatureToggleClient>[] => {
    return Array.from({ length: spec.featuresCount }).map((v, i) => {
        return mockFeatureToggle({
            name: `${seedSchema}_feature_${i}`,
        });
    });
};

const seedSegmentsDatabase = async (
    app: IUnleashTest,
    spec: ISeedSegmentSpec,
): Promise<void> => {
    await Promise.all(
        seedSegments(spec).map((seed) => {
            return createSegment(app, seed);
        }),
    );

    const features = await Promise.all(
        seedFeatures(spec).map(async (seed) => {
            return createFeatureToggle(app, seed);
        }),
    );

    const segments = await fetchSegments(app);
    assert(features.length === spec.featuresCount);
    assert(segments.length === spec.segmentsPerFeature);

    const addSegment = (feature: IFeatureToggleClient, segment: ISegment) => {
        return addSegmentToStrategy(app, segment.id, feature.strategies[0].id);
    };

    for (const feature of features) {
        await Promise.all(
            segments.map((segment) => addSegment(feature, segment)),
        );
    }
};

const main = async (): Promise<void> => {
    const db = await dbInit(seedSchema, getLogger);
    const app = await setupApp(db.stores);

    await seedSegmentsDatabase(app, seedSegmentSpec);
    await app.destroy();
    await db.destroy();
};

main().catch(console.error);
