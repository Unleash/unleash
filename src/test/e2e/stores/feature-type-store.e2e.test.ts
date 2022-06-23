import { IFeatureTypeStore } from 'lib/types/stores/feature-type-store';
import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

let stores;
let db;
let featureTypeStore: IFeatureTypeStore;

beforeAll(async () => {
    db = await dbInit('feature_type_store_serial', getLogger);
    stores = db.stores;
    featureTypeStore = stores.featureTypeStore;
});

afterAll(async () => {
    await db.destroy();
});

test('should have 5 default types', async () => {
    const types = await featureTypeStore.getAll();
    expect(types.length).toBe(5);
    expect(types[0].name).toBe('Release');
});

test('should be possible to get by name', async () => {
    const type = await featureTypeStore.getByName('Experiment');
    expect(type.name).toBe('Experiment');
});

test('should be possible to get by id', async () => {
    expect(await featureTypeStore.exists('unknown')).toEqual(false);
    expect(await featureTypeStore.exists('operational')).toEqual(true);
});

test('should be possible to delete by id', async () => {
    const types = await featureTypeStore.getAll();
    const deleteType = types.pop();
    await featureTypeStore.delete(deleteType.id);
    const typesAfterDelete = await featureTypeStore.getAll();
    expect(typesAfterDelete.length).toBe(4);
});
