import { createMockTransactionStarter } from '../lib/db/transactional';
import { IUnleashConfig } from '../lib/server-impl';
import { GroupService } from '../lib/services/group-service';
import dbInit, { ITestDb } from './/e2e/helpers/database-init';
import { createTestConfig } from './config/test-config';
import FakeGroupStore from './fixtures/fake-group-store';
import noLoggerProvider from './fixtures/no-logger';

let stores;
let db: ITestDb;
let config: IUnleashConfig;

beforeAll(async () => {
    db = await dbInit('transactional_serial', noLoggerProvider);
    config = createTestConfig({
        getLogger: noLoggerProvider,
    });
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

test('should allow transactions be swapped for a different implementation', async () => {
    const mockStores = {
        groupStore: new FakeGroupStore(),
        eventStore: null,
        userStore: null,
    };

    expect((await mockStores.groupStore.getAll()).length).toBe(0);

    const groupService = new GroupService(
        mockStores,
        config,
        createMockTransactionStarter(),
    );
    const externalGroups = ['group-one', 'group-two'];

    await groupService.syncExternalGroups(7, externalGroups, 'David Fincher');

    expect((await mockStores.groupStore.getAll()).length).toBe(2);
});
