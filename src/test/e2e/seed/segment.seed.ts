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

interface ISeedSegmentSpec {
    featuresCount: number;
    segmentsPerFeature: number;
    constraintsPerSegment: number;
    valuesPerConstraint: number;
}

// The database schema to populate.
const SEED_SCHEMA = 'seed';

// A multiplier for the number of rows to insert.
const SEED_SIZE = 10;

const fetchSegments = (app: IUnleashTest): Promise<ISegment[]> => {
    return app.services.segmentService.getAll();
};

const fetchFeatures = (app: IUnleashTest): Promise<IFeatureToggleClient[]> => {
    return app.request
        .get('/api/admin/features')
        .expect(200)
        .then((res) => res.body.features);
};

const createSegment = (
    app: IUnleashTest,
    postData: object,
): Promise<unknown> => {
    const user = { email: 'test@example.com' } as User;
    return app.services.segmentService.create(postData, user);
};

const createFeatureToggle = (
    app: IUnleashTest,
    postData: object,
    expectStatusCode = 201,
): Promise<unknown> => {
    return app.request
        .post('/api/admin/features')
        .send(postData)
        .expect(expectStatusCode);
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

const seedSegments = (spec: ISeedSegmentSpec): Partial<ISegment>[] => {
    return Array.from({ length: spec.segmentsPerFeature }).map((v, i) => {
        return {
            name: `${SEED_SCHEMA}_segment_${i}`,
            constraints: seedConstraints(spec),
        };
    });
};

const seedFeatures = (
    spec: ISeedSegmentSpec,
): Partial<IFeatureToggleClient>[] => {
    return Array.from({ length: spec.featuresCount }).map((v, i) => {
        return mockFeatureToggle({
            name: `${SEED_SCHEMA}_feature_${i}`,
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

    await Promise.all(
        seedFeatures(spec).map((seed) => {
            return createFeatureToggle(app, seed);
        }),
    );

    const features = await fetchFeatures(app);
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
    const spec: ISeedSegmentSpec = {
        featuresCount: SEED_SIZE,
        segmentsPerFeature: SEED_SIZE,
        constraintsPerSegment: SEED_SIZE,
        valuesPerConstraint: SEED_SIZE * 10,
    };

    const db = await dbInit(SEED_SCHEMA, getLogger);
    const app = await setupApp(db.stores);

    await seedSegmentsDatabase(app, spec);
    await app.destroy();
    await db.destroy();
};

main().catch(console.error);
