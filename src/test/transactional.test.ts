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

test('should fail if we run a method that requires transactional outside of a transaction', async () => {
    const newUser = await stores.userStore.insert({
        name: 'Tyler Durden',
    });
    const oldUser = await stores.userStore.insert({
        name: 'Bob Poulson',
    });

    const group = await stores.groupStore.create({
        name: 'TestGroup',
    });

    await expect(async () =>
        stores.groupStore.updateGroupUsers(
            group.id,
            [
                {
                    user: newUser,
                },
            ],
            [],
            [
                {
                    groupId: group.id,
                    userId: oldUser.id,
                },
            ],
            'David Fincher',
        ),
    ).rejects.toThrow(Error);
});

test('should not fail if we run a method that requires transactional outside of a transaction in prod mode', async () => {
    const newUser = await stores.userStore.insert({
        name: 'Tyler Durden',
    });
    const oldUser = await stores.userStore.insert({
        name: 'Bob Poulson',
    });

    const group = await stores.groupStore.create({
        name: 'TestGroup',
    });

    process.env.NODE_ENV = 'prod';

    await stores.groupStore.updateGroupUsers(
        group.id,
        [
            {
                user: newUser,
            },
        ],
        [],
        [
            {
                groupId: group.id,
                userId: oldUser.id,
            },
        ],
        'David Fincher',
    );
});

test('should not fail if we run a method that requires transactional inside of a transaction in test mode', async () => {
    const newUser = await stores.userStore.insert({
        name: 'Tyler Durden',
    });
    const oldUser = await stores.userStore.insert({
        name: 'Bob Poulson',
    });

    const group = await stores.groupStore.create({
        name: 'TestGroup',
    });

    await db.db.transaction(async (trx) => {
        await stores.groupStore.transactional(trx).updateGroupUsers(
            group.id,
            [
                {
                    user: newUser,
                },
            ],
            [],
            [
                {
                    groupId: group.id,
                    userId: oldUser.id,
                },
            ],
            'David Fincher',
        );
    });
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
