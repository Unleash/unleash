import type { IFeatureTypeStore } from '../../../lib/types/stores/feature-type-store.js';
import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import type { IUnleashStores } from '../../../lib/types/index.js';

let stores: IUnleashStores;
let db: ITestDb;
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
    const deleteType = types.pop()!;
    await featureTypeStore.delete(deleteType.id);
    const typesAfterDelete = await featureTypeStore.getAll();
    expect(typesAfterDelete.length).toBe(4);
});

describe('update lifetimes', () => {
    test.each([null, 5])('it sets lifetimeDays to %s', async (newLifetime) => {
        const featureTypes = await featureTypeStore.getAll();

        for (const type of featureTypes) {
            const updated = await featureTypeStore.updateLifetime(
                type.id,
                newLifetime,
            );

            expect(updated?.lifetimeDays).toBe(newLifetime);
            const fromStore = await featureTypeStore.get(type.id);
            expect(updated).toMatchObject(fromStore!);
        }
    });

    test("It returns undefined if you try to update a feature type that doesn't exist", async () => {
        expect(
            await featureTypeStore.updateLifetime('bogus-type', 40),
        ).toBeUndefined();
    });
});
