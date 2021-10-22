import { IFeatureStrategiesStore } from 'lib/types/stores/feature-strategies-store';
import { IFeatureToggleStore } from 'lib/types/stores/feature-toggle-store';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

let stores;
let db;
let featureStrategiesStore: IFeatureStrategiesStore;
let featureToggleStore: IFeatureToggleStore;

const featureName = 'test-strategies-move-project';

beforeAll(async () => {
    db = await dbInit('feature_strategies_store_serial', getLogger);
    stores = db.stores;
    featureStrategiesStore = stores.featureStrategiesStore;
    featureToggleStore = stores.featureToggleStore;
    await featureToggleStore.create('default', { name: featureName });
});

afterAll(async () => {
    await db.destroy();
});

test('Can successfully update project for all strategies belonging to feature', async () => {
    const newProjectId = 'different-project';
    const oldProjectId = 'default';
    const environment = 'default';
    await featureStrategiesStore.createStrategyFeatureEnv({
        strategyName: 'default',
        projectId: oldProjectId,
        environment,
        featureName,
        constraints: [],
        parameters: {},
        sortOrder: 15,
    });
    await featureStrategiesStore.createStrategyFeatureEnv({
        strategyName: 'default',
        projectId: oldProjectId,
        environment,
        featureName,
        constraints: [],
        parameters: {},
        sortOrder: 20,
    });
    const strats = await featureStrategiesStore.getStrategiesForFeatureEnv(
        oldProjectId,
        featureName,
        environment,
    );
    expect(strats).toHaveLength(2);
    await featureStrategiesStore.setProjectForStrategiesBelongingToFeature(
        featureName,
        newProjectId,
    );
    const newProjectStrats =
        await featureStrategiesStore.getStrategiesForFeatureEnv(
            newProjectId,
            featureName,
            environment,
        );
    expect(newProjectStrats).toHaveLength(2);

    const oldProjectStrats =
        await featureStrategiesStore.getStrategiesForFeatureEnv(
            oldProjectId,
            featureName,
            environment,
        );
    return expect(oldProjectStrats).toHaveLength(0);
});
