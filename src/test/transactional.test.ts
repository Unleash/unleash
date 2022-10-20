import dbInit, { ITestDb } from './/e2e/helpers/database-init';
import getLogger from './fixtures/no-logger';

let stores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('transactional_serial', getLogger);
    stores = db.stores;
});

afterAll(async () => {
    await db.destroy();
});

test('should actually do something transactional mode', async () => {
    await db.db.transaction(async (trx) => {
        await stores.groupStore.transactional(trx).create({
            name: 'some_other_group',
            description: 'admin_group',
            mappingsSSO: ['admin'],
        });
    });

    const groups = await stores.groupStore.getAll();
    const createdGroup = groups.find((group) => {
        return group.name === 'some_other_group';
    });
    expect(createdGroup).toBeDefined();
});

test('should fail entire transaction if encountering an error', async () => {
    await db.db.transaction(async (trx) => {
        const featureDTO = {
            name: 'SomeUniqueNameThatSoonWontBeUnique',
        };

        await stores.featureToggleStore
            .transactional(trx)
            .create('default', featureDTO);
        await stores.featureToggleStore
            .transactional(trx)
            .create('default', featureDTO);
    });
    const toggles = await stores.featureToggleStore.getAll();
    expect(toggles.length).toBe(0);
});
