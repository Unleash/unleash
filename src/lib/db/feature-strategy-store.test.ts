import dbInit, { type ITestDb } from '../../test/e2e/helpers/database-init.js';
import getLogger from '../../test/fixtures/no-logger.js';
import { DEFAULT_ENV } from '../server-impl.js';
import type {
    IFeatureStrategiesStore,
    IFeatureStrategy,
    IFeatureToggleStore,
    IStrategyStore,
    PartialSome,
} from '../types/index.js';

let db: ITestDb;

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
    const featureStrategiesStore: IFeatureStrategiesStore =
        db.stores.featureStrategiesStore;

    // Act
    const inUseCount =
        await featureStrategiesStore.getCustomStrategiesInUseCount();

    // Assert
    expect(inUseCount).toEqual(0);
});

test('returns 0 if no custom strategies are in use', async () => {
    // Arrange
    const featureToggleStore: IFeatureToggleStore =
        db.stores.featureToggleStore;
    const featureStrategiesStore: IFeatureStrategiesStore =
        db.stores.featureStrategiesStore;
    const strategyStore: IStrategyStore = db.stores.strategyStore;

    await featureToggleStore.create('default', {
        name: 'test-toggle-2',
        createdByUserId: 9999,
    });

    await strategyStore.createStrategy({
        name: 'strategy-2',
        parameters: [],
        description: '',
    });

    // Act
    const inUseCount =
        await featureStrategiesStore.getCustomStrategiesInUseCount();

    // Assert
    expect(inUseCount).toEqual(0);
});

test('counts custom strategies in use', async () => {
    // Arrange
    const featureToggleStore: IFeatureToggleStore =
        db.stores.featureToggleStore;
    const featureStrategiesStore: IFeatureStrategiesStore =
        db.stores.featureStrategiesStore;
    const strategyStore: IStrategyStore = db.stores.strategyStore;

    await featureToggleStore.create('default', {
        name: 'test-toggle',
        createdByUserId: 9999,
    });

    await strategyStore.createStrategy({
        name: 'strategy-1',
        parameters: [],
        description: '',
    });

    await featureStrategiesStore.createStrategyFeatureEnv({
        projectId: 'default',
        featureName: 'test-toggle',
        strategyName: 'strategy-1',
        environment: DEFAULT_ENV,
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
    environment: DEFAULT_ENV,
    parameters: {},
    constraints: [],
    variants: [],
};
test('increment sort order on each new insert', async () => {
    const featureToggleStore: IFeatureToggleStore =
        db.stores.featureToggleStore;
    const featureStrategiesStore: IFeatureStrategiesStore =
        db.stores.featureStrategiesStore;

    await featureToggleStore.create('default', {
        name: 'test-toggle-increment',
        createdByUserId: 9999,
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
    const secondStrategy =
        await featureStrategiesStore.getStrategyById(secondId);
    const thirdStrategy = await featureStrategiesStore.getStrategyById(thirdId);

    expect(firstStrategy.sortOrder).toEqual(0);
    expect(secondStrategy.sortOrder).toEqual(50);
    expect(thirdStrategy.sortOrder).toEqual(51);
});
