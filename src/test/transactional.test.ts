import dbInit, { ITestDb } from './/e2e/helpers/database-init';
import getLogger from './fixtures/no-logger';

let stores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('group_service_serial', getLogger);
    stores = db.stores;

    await stores.groupStore.create({
        name: 'dev_group',
        description: 'dev_group',
        mappingsSSO: ['dev'],
    });
    await stores.groupStore.create({
        name: 'maintainer_group',
        description: 'maintainer_group',
        mappingsSSO: ['maintainer'],
    });

    await stores.groupStore.create({
        name: 'admin_group',
        description: 'admin_group',
        mappingsSSO: ['admin'],
    });
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
