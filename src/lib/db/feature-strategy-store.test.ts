import dbInit from '../../test/e2e/helpers/database-init';
import getLogger from '../../test/fixtures/no-logger';
import FeatureStrategiesStore from './feature-strategy-store';
import FeatureToggleStore from './feature-toggle-store';
import StrategyStore from './strategy-store';
import { IFeatureStrategy, PartialSome } from '../types';

let db;

beforeAll(async () => {
    db = await dbInit('feature_strategy_store_serial', getLogger);
    getLogger.setMuteError(true);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
    getLogger.setMuteError(false);
});

test('returns 0 if no custom strategies', async () => {
    // Arrange
    const featureStrategiesStore: FeatureStrategiesStore =
        db.stores.featureStrategiesStore;

    // Act
    const inUseCount =
        await featureStrategiesStore.getCustomStrategiesInUseCount();

    // Assert
    expect(inUseCount).toEqual(0);
});

test('returns 0 if no custom strategies are in use', async () => {
    // Arrange
    const featureToggleStore: FeatureToggleStore = db.stores.featureToggleStore;
    const featureStrategiesStore: FeatureStrategiesStore =
        db.stores.featureStrategiesStore;
    const strategyStore: StrategyStore = db.stores.strategyStore;

    featureToggleStore.create('default', {
        name: 'test-toggle-2',
    });

    strategyStore.createStrategy({
        name: 'strategy-2',
        built_in: 0,
        parameters: [],
        description: '',
        createdAt: '2023-06-09T09:00:12.242Z',
    });

    // Act
    const inUseCount =
        await featureStrategiesStore.getCustomStrategiesInUseCount();

    // Assert
    expect(inUseCount).toEqual(0);
});

test('counts custom strategies in use', async () => {
    // Arrange
    const featureToggleStore: FeatureToggleStore = db.stores.featureToggleStore;
    const featureStrategiesStore: FeatureStrategiesStore =
        db.stores.featureStrategiesStore;
    const strategyStore: StrategyStore = db.stores.strategyStore;

    await featureToggleStore.create('default', {
        name: 'test-toggle',
    });

    await strategyStore.createStrategy({
        name: 'strategy-1',
        built_in: 0,
        parameters: [],
        description: '',
        createdAt: '2023-06-09T09:00:12.242Z',
    });

    await featureStrategiesStore.createStrategyFeatureEnv({
        projectId: 'default',
        featureName: 'test-toggle',
        strategyName: 'strategy-1',
        environment: 'default',
        parameters: {},
        constraints: [],
        variants: [],
    });

    // Act
    const inUseCount =
        await featureStrategiesStore.getCustomStrategiesInUseCount();

    // Assert
    expect(inUseCount).toEqual(1);
});

const baseStrategy: PartialSome<IFeatureStrategy, 'id' | 'createdAt'> = {
    projectId: 'default',
    featureName: 'test-toggle-increment',
    strategyName: 'strategy-1',
    environment: 'default',
    parameters: {},
    constraints: [],
    variants: [],
};
test('increment sort order on each new insert', async () => {
    const featureToggleStore: FeatureToggleStore = db.stores.featureToggleStore;
    const featureStrategiesStore: FeatureStrategiesStore =
        db.stores.featureStrategiesStore;

    await featureToggleStore.create('default', {
        name: 'test-toggle-increment',
    });

    const { id: firstId } =
        await featureStrategiesStore.createStrategyFeatureEnv({
            ...baseStrategy,
            featureName: 'test-toggle-increment',
            strategyName: 'strategy-1',
            // sort order implicitly 0
        });
    const { id: secondId } =
        await featureStrategiesStore.createStrategyFeatureEnv({
            ...baseStrategy,
            featureName: 'test-toggle-increment',
            strategyName: 'strategy-2',
            sortOrder: 50, // explicit sort order
        });
    const { id: thirdId } =
        await featureStrategiesStore.createStrategyFeatureEnv({
            ...baseStrategy,
            featureName: 'test-toggle-increment',
            strategyName: 'strategy-2',
            // implicit sort order incremented by 1
        });

    const firstStrategy = await featureStrategiesStore.getStrategyById(firstId);
    const secondStrategy = await featureStrategiesStore.getStrategyById(
        secondId,
    );
    const thirdStrategy = await featureStrategiesStore.getStrategyById(thirdId);

    expect(firstStrategy.sortOrder).toEqual(0);
    expect(secondStrategy.sortOrder).toEqual(50);
    expect(thirdStrategy.sortOrder).toEqual(51);
});
