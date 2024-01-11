import { IUnleashStores } from '../../../lib/types';
import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { IFeatureEnvironmentStore } from '../../../lib/types/stores/feature-environment-store';
import { IFeatureToggleStore } from '../../../lib/features/feature-toggle/types/feature-toggle-store-type';
import { IEnvironmentStore } from '../../../lib/features/project-environments/environment-store-type';

let db: ITestDb;
let stores: IUnleashStores;
let featureEnvironmentStore: IFeatureEnvironmentStore;
let featureStore: IFeatureToggleStore;
let environmentStore: IEnvironmentStore;

beforeAll(async () => {
    db = await dbInit('feature_environment_store_serial', getLogger);
    stores = db.stores;
    featureEnvironmentStore = stores.featureEnvironmentStore;
    environmentStore = stores.environmentStore;
    featureStore = stores.featureToggleStore;
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
