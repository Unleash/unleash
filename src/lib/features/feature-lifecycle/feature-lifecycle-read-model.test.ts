import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { FeatureLifecycleReadModel } from './feature-lifecycle-read-model';
import type { IFeatureLifecycleStore } from './feature-lifecycle-store-type';
import type { IFeatureLifecycleReadModel } from './feature-lifecycle-read-model-type';
import type { IFeatureToggleStore } from '../feature-toggle/types/feature-toggle-store-type';
import type { IFlagResolver } from '../../types';

let db: ITestDb;
let featureLifecycleReadModel: IFeatureLifecycleReadModel;
let featureLifecycleStore: IFeatureLifecycleStore;
let featureToggleStore: IFeatureToggleStore;

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

beforeAll(async () => {
    db = await dbInit('feature_lifecycle_read_model', getLogger);
    featureLifecycleReadModel = new FeatureLifecycleReadModel(
        db.rawDatabase,
        alwaysOnFlagResolver,
    );
    featureLifecycleStore = db.stores.featureLifecycleStore;
    featureToggleStore = db.stores.featureToggleStore;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

beforeEach(async () => {
    await featureToggleStore.deleteAll();
});

test('can return stage count', async () => {
    await featureToggleStore.create('default', {
        name: 'featureA',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'featureB',
        createdByUserId: 9999,
    });
    await featureToggleStore.create('default', {
        name: 'featureC',
        createdByUserId: 9999,
    });
    await featureLifecycleStore.insert([
        { feature: 'featureA', stage: 'initial' },
        { feature: 'featureB', stage: 'initial' },
        { feature: 'featureC', stage: 'initial' },
    ]);
    await featureLifecycleStore.insert([
        { feature: 'featureA', stage: 'pre-live' },
    ]);

    const stageCount = await featureLifecycleReadModel.getStageCount();
    expect(stageCount).toMatchObject([
        { stage: 'pre-live', count: 1 },
        { stage: 'initial', count: 2 },
    ]);

    const stageCountByProject =
        await featureLifecycleReadModel.getStageCountByProject();
    expect(stageCountByProject).toMatchObject([
        { project: 'default', stage: 'pre-live', count: 1 },
        { project: 'default', stage: 'initial', count: 2 },
    ]);
});
