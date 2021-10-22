import { IUnleashStores } from '../../../lib/types';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { IFeatureEnvironmentStore } from '../../../lib/types/stores/feature-environment-store';
import { IFeatureToggleStore } from '../../../lib/types/stores/feature-toggle-store';
import { IEnvironmentStore } from '../../../lib/types/stores/environment-store';

let db;
let stores: IUnleashStores;
let featureEnvironmentStore: IFeatureEnvironmentStore;
let featureStore: IFeatureToggleStore;
let environmentStore: IEnvironmentStore;

beforeEach(async () => {
    db = await dbInit('feature_environment_store_serial', getLogger);
    stores = db.stores;
    featureEnvironmentStore = stores.featureEnvironmentStore;
    environmentStore = stores.environmentStore;
    featureStore = stores.featureToggleStore;
});

afterEach(async () => {
    await db.destroy();
});

test('Setting enabled to same as existing value returns 0', async () => {
    let envName = 'enabled-to-true';
    let featureName = 'enabled-to-true-feature';
    await environmentStore.create({
        name: envName,
        enabled: true,
        type: 'test',
    });
    await featureStore.create('default', { name: featureName });
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
    let envName = 'enabled-toggle';
    let featureName = 'enabled-toggle-feature';
    await environmentStore.create({
        name: envName,
        enabled: true,
        type: 'test',
    });
    await featureStore.create('default', { name: featureName });
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
