import type { ILargestResourcesReadModel } from './largest-resources-read-model-type.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import type { IFeatureToggleStore } from '../../feature-toggle/types/feature-toggle-store-type.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import type { IFeatureStrategiesStore } from '../../feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { IFeatureStrategy } from '../../../types/index.js';
import { DEFAULT_ENV } from '../../../server-impl.js';

let db: ITestDb;
let largestResourcesReadModel: ILargestResourcesReadModel;
let featureToggleStore: IFeatureToggleStore;
let featureStrategiesStore: IFeatureStrategiesStore;

beforeAll(async () => {
    db = await dbInit('largest_resources_read_model', getLogger);
    featureToggleStore = db.stores.featureToggleStore;
    featureStrategiesStore = db.stores.featureStrategiesStore;
    largestResourcesReadModel = db.stores.largestResourcesReadModel;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

beforeEach(async () => {
    await featureToggleStore.deleteAll();
});

type FeatureConfig = Pick<
    IFeatureStrategy,
    'featureName' | 'constraints' | 'parameters' | 'variants'
>;
const createFeature = async (config: FeatureConfig) => {
    await featureToggleStore.create('default', {
        name: config.featureName,
        createdByUserId: 9999,
    });
    await featureStrategiesStore.createStrategyFeatureEnv({
        strategyName: 'flexibleRollout',
        projectId: 'default',
        environment: DEFAULT_ENV,
        featureName: config.featureName,
        constraints: config.constraints,
        parameters: config.parameters,
        variants: config.variants,
    });
};

test('can calculate resource size', async () => {
    await createFeature({
        featureName: 'featureA',
        parameters: {
            groupId: 'flag_init_test_1',
            rollout: '25',
            stickiness: 'default',
        },
        constraints: [
            {
                contextName: 'clientId',
                operator: 'IN',
                values: ['1', '2', '3', '4', '5', '6'],
                caseInsensitive: false,
                inverted: false,
            },
        ],
        variants: [
            {
                name: 'a',
                weight: 1000,
                weightType: 'fix',
                stickiness: 'default',
            },
        ],
    });

    await createFeature({
        featureName: 'featureB',
        parameters: {
            groupId: 'featureB',
            rollout: '100',
            stickiness: 'default',
        },
        constraints: [],
        variants: [],
    });

    const [project] =
        await largestResourcesReadModel.getLargestProjectEnvironments(1);
    const [feature1, feature2] =
        await largestResourcesReadModel.getLargestFeatureEnvironments(2);

    expect(project.size).toBeGreaterThan(400);
    expect(project.size).toBe(feature1.size + feature2.size);
    expect(feature1.size).toBeGreaterThan(feature2.size);
});
