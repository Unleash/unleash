import { IFeatureStrategiesStore } from '../../../features/feature-toggle/types/feature-toggle-strategies-store-type';
import { IFeatureToggleStore } from '../../../features/feature-toggle/types/feature-toggle-store-type';
import dbInit, { ITestDb } from '../../../../test/e2e/helpers/database-init';
import getLogger from '../../../../test/fixtures/no-logger';
import { IUnleashStores } from '../../../types';

let stores: IUnleashStores;
let db: ITestDb;
let featureStrategiesStore: IFeatureStrategiesStore;
let featureToggleStore: IFeatureToggleStore;

const featureName = 'test-strategies-move-project';

beforeAll(async () => {
    db = await dbInit('feature_strategies_store_serial', getLogger);
    stores = db.stores;
    featureStrategiesStore = stores.featureStrategiesStore;
    featureToggleStore = stores.featureToggleStore;
    await featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
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

test('Can query for features with tags', async () => {
    const tag = { type: 'simple', value: 'hello-tags' };
    await stores.tagStore.createTag(tag);
    await featureToggleStore.create('default', {
        name: 'to-be-tagged',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'not-tagged',
        createdByUserId: 9999,
    });
    await stores.featureTagStore.tagFeature('to-be-tagged', tag, -1337);
    const features = await featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
        tag: [[tag.type, tag.value]],
    });
    expect(features).toHaveLength(1);
});

test('Can query for features with namePrefix', async () => {
    await featureToggleStore.create('default', {
        name: 'nameprefix-to-be-hit',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'nameprefix-not-be-hit',
        createdByUserId: 9999,
    });
    const features = await featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
        namePrefix: 'nameprefix-to',
    });
    expect(features).toHaveLength(1);
});

test('Can query for features with namePrefix and tags', async () => {
    const tag = { type: 'simple', value: 'hello-nameprefix-and-tags' };
    await stores.tagStore.createTag(tag);
    await featureToggleStore.create('default', {
        name: 'to-be-tagged-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'not-tagged-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'tagged-but-not-hit-nameprefix-and-tags',
        createdByUserId: 9999,
    });
    await stores.featureTagStore.tagFeature(
        'to-be-tagged-nameprefix-and-tags',
        tag,
        9999,
    );
    await stores.featureTagStore.tagFeature(
        'tagged-but-not-hit-nameprefix-and-tags',
        tag,
        9999,
    );
    const features = await featureStrategiesStore.getFeatureOverview({
        projectId: 'default',
        tag: [[tag.type, tag.value]],
        namePrefix: 'to',
    });
    expect(features).toHaveLength(1);
});
