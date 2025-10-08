import type {
    IFeatureStrategiesStore,
    IUnleashStores,
} from '../../../lib/types/index.js';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import type { IFeatureEnvironmentStore } from '../../../lib/types/stores/feature-environment-store.js';
import type { IFeatureToggleStore } from '../../../lib/features/feature-toggle/types/feature-toggle-store-type.js';
import type { IEnvironmentStore } from '../../../lib/features/project-environments/environment-store-type.js';

let db: ITestDb;
let stores: IUnleashStores;
let featureEnvironmentStore: IFeatureEnvironmentStore;
let featureStore: IFeatureToggleStore;
let environmentStore: IEnvironmentStore;
let featureStrategiesStore: IFeatureStrategiesStore;

beforeAll(async () => {
    db = await dbInit('feature_environment_store_serial', getLogger);
    stores = db.stores;
    featureEnvironmentStore = stores.featureEnvironmentStore;
    environmentStore = stores.environmentStore;
    featureStore = stores.featureToggleStore;
    featureStrategiesStore = stores.featureStrategiesStore;
});

afterAll(async () => {
    await db.destroy();
});

test('Setting enabled to same as existing value returns 0', async () => {
    const envName = 'enabled-to-true';
    const featureName = 'enabled-to-true-feature';
    await environmentStore.create({
        name: envName,
        enabled: true,
        type: 'test',
    });
    await featureStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await featureEnvironmentStore.connectProject(envName, 'default');
    await featureEnvironmentStore.connectFeatures(envName, 'default');
    const enabledStatus = await featureEnvironmentStore.isEnvironmentEnabled(
        featureName,
        envName,
    );
    const changed = await featureEnvironmentStore.setEnvironmentEnabledStatus(
        envName,
        featureName,
        enabledStatus,
    );
    expect(changed).toBe(0);
});

test('Setting enabled to not existing value returns 1', async () => {
    const envName = 'enabled-toggle';
    const featureName = 'enabled-toggle-feature';
    await environmentStore.create({
        name: envName,
        enabled: true,
        type: 'test',
    });
    await featureStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await featureEnvironmentStore.connectProject(envName, 'default');
    await featureEnvironmentStore.connectFeatures(envName, 'default');
    const enabledStatus = await featureEnvironmentStore.isEnvironmentEnabled(
        featureName,
        envName,
    );
    const changed = await featureEnvironmentStore.setEnvironmentEnabledStatus(
        envName,
        featureName,
        !enabledStatus,
    );
    expect(changed).toBe(1);
});

test('Copying features also copies variants', async () => {
    const envName = 'copy-env';
    const featureName = 'copy-env-toggle-feature';
    await environmentStore.create({
        name: envName,
        enabled: true,
        type: 'test',
    });
    await featureStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await featureEnvironmentStore.connectProject(envName, 'default');
    await featureEnvironmentStore.connectFeatures(envName, 'default');

    const variant = {
        name: 'a',
        weight: 1,
        stickiness: 'default',
        weightType: 'fix' as any,
    };
    await featureEnvironmentStore.setVariantsToFeatureEnvironments(
        featureName,
        [envName],
        [variant],
    );

    await environmentStore.create({
        name: 'clone',
        enabled: true,
        type: 'test',
    });
    await featureEnvironmentStore.connectProject('clone', 'default');

    await featureEnvironmentStore.copyEnvironmentFeaturesByProjects(
        envName,
        'clone',
        ['default'],
    );

    const cloned = await featureEnvironmentStore.get({
        featureName: featureName,
        environment: 'clone',
    });
    expect(cloned!.variants).toMatchObject([variant]);
});

test('Copying strategies also copies strategy variants', async () => {
    const envName = 'copy-strategy';
    const featureName = 'copy-env-strategy-feature';
    await environmentStore.create({
        name: envName,
        enabled: true,
        type: 'test',
    });
    await featureStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    await featureEnvironmentStore.connectProject(envName, 'default');
    await featureEnvironmentStore.connectFeatures(envName, 'default');

    const strategyVariant = {
        name: 'a',
        weight: 1,
        stickiness: 'default',
        weightType: 'fix' as any,
    };
    await featureStrategiesStore.createStrategyFeatureEnv({
        environment: envName,
        projectId: 'default',
        featureName,
        strategyName: 'default',
        variants: [strategyVariant],
        parameters: {},
        constraints: [],
    });

    await environmentStore.create({
        name: 'clone-2',
        enabled: true,
        type: 'test',
    });
    await featureEnvironmentStore.connectProject('clone-2', 'default');

    await featureEnvironmentStore.cloneStrategies(envName, 'clone-2', [
        'default',
    ]);

    const clonedStrategy =
        await featureStrategiesStore.getStrategiesForFeatureEnv(
            'default',
            featureName,
            'clone-2',
        );
    expect(clonedStrategy.length).toBe(1);
    expect(clonedStrategy[0].variants).toMatchObject([strategyVariant]);
});
