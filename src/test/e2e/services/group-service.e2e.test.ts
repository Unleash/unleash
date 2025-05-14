import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import { createTestConfig } from '../../config/test-config.js';
import { GroupService } from '../../../lib/services/group-service.js';
import type { EventService } from '../../../lib/services/index.js';
import {
    type IGroupStore,
    type IUnleashStores,
    type IUser,
    TEST_AUDIT_USER,
} from '../../../lib/types/index.js';
import { createEventsService } from '../../../lib/features/index.js';

let stores: IUnleashStores;
let db: ITestDb;

let eventService: EventService;
let groupService: GroupService;
let groupStore: IGroupStore;
let user: IUser;

beforeAll(async () => {
    db = await dbInit('group_service_serial', getLogger);
    stores = db.stores;
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    const config = createTestConfig({
        getLogger,
    });
    eventService = createEventsService(db.rawDatabase, config);
    groupService = new GroupService(stores, config, eventService);
    groupStore = stores.groupStore;

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

afterEach(async () => {});

// Note: events come in reverse order, the first in the list is the last pushed
const getTestEvents = async () => {
    return (await eventService.getEvents()).events.filter(
        (e) => e.createdBy !== 'migration',
    );
};

test('should have three group', async () => {
    const project = await groupService.getAll();
    expect(project.length).toBe(3);
});

test('should add person to 2 groups', async () => {
    await groupService.syncExternalGroups(user.id, ['dev', 'maintainer']);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(2);
    const events = await getTestEvents();
    expect(events[0]).toMatchObject({
        type: 'group-user-added',
        data: {
            userId: user.id,
            groupId: groups[1].id,
        },
    });
    expect(events[1]).toMatchObject({
        type: 'group-user-added',
        data: {
            userId: user.id,
            groupId: groups[0].id,
        },
    });
});

// this test depends on the other tests being executed
test('should remove person from one group', async () => {
    const removedGroups = (await groupService.getGroupsForUser(user.id)).filter(
        (g) => !g.mappingsSSO?.includes('maintainer'),
    );
    await groupService.syncExternalGroups(user.id, ['maintainer']);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(1);
    expect(groups[0].name).toEqual('maintainer_group');

    expect(removedGroups).toHaveLength(1);
    const events = await getTestEvents();
    expect(events[0]).toMatchObject({
        type: 'group-user-removed',
        preData: {
            userId: user.id,
            groupId: removedGroups[0].id,
        },
    });
});

// this test depends on the other tests being executed
test('should add person to completely new group with new name', async () => {
    const removedGroups = (await groupService.getGroupsForUser(user.id)).filter(
        (g) => !g.mappingsSSO?.includes('dev'),
    );
    await groupService.syncExternalGroups(user.id, ['dev']);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(1);
    expect(groups[0].name).toEqual('dev_group');

    const events = await getTestEvents();
    expect(removedGroups).toHaveLength(1);
    expect(events[0]).toMatchObject({
        type: 'group-user-removed',
        preData: {
            userId: user.id,
            groupId: removedGroups[0].id,
        },
    });
    expect(events[1]).toMatchObject({
        type: 'group-user-added',
        data: {
            userId: user.id,
            groupId: groups[0].id,
        },
    });
});

test('should not update groups when not string array ', async () => {
    const beforeEvents = await getTestEvents();
    await groupService.syncExternalGroups(user.id, 'Everyone' as any);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(1);
    expect(groups[0].name).toEqual('dev_group');
    const afterEvents = await getTestEvents();
    expect(beforeEvents).toHaveLength(afterEvents.length);
});

// this test depends on the other tests being executed
test('should clear groups when empty array ', async () => {
    const removedGroups = await groupService.getGroupsForUser(user.id);
    await groupService.syncExternalGroups(user.id, []);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(0);
    expect(removedGroups).toHaveLength(1);
    const events = await getTestEvents();
    expect(events[0]).toMatchObject({
        type: 'group-user-removed',
        preData: {
            userId: user.id,
            groupId: removedGroups[0].id,
        },
    });
});

test('should not remove user from no SSO definition group', async () => {
    const beforeEvents = await getTestEvents();
    const group = await groupStore.create({
        name: 'no_mapping_group',
        description: 'no_mapping_group',
    });
    await groupStore.addUserToGroups(user.id, [group.id]);
    await groupService.syncExternalGroups(user.id, []);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(1);
    expect(groups[0].name).toEqual('no_mapping_group');
    const afterEvents = await getTestEvents();
    expect(beforeEvents).toHaveLength(afterEvents.length);
});

test('adding a root role to a group with a project role should not fail', async () => {
    const group = await groupService.createGroup(
        {
            name: 'root_group',
            description: 'root_group',
        },
        TEST_AUDIT_USER,
    );

    await stores.accessStore.addGroupToRole(group.id, 1, 'test', 'default');

    const updatedGroup = await groupService.updateGroup(
        {
            id: group.id!,
            name: group.name,
            users: [],
            rootRole: 1,
            createdAt: new Date(),
            createdBy: 'test',
        },
        TEST_AUDIT_USER,
    );

    expect(updatedGroup).toMatchObject({
        description: group.description,
        id: group.id,
        mappingsSSO: [],
        name: group.name,
        rootRole: 1,
    });

    const events = await getTestEvents();
    expect(events[1]).toMatchObject({
        type: 'group-created',
        data: {
            description: group.description,
            name: group.name,
        },
    });
    expect(events[0]).toMatchObject({
        type: 'group-updated',
        data: {
            description: group.description,
            id: group.id,
            mappingsSSO: [],
            name: group.name,
            rootRole: 1,
        },
        preData: {
            description: group.description,
            id: group.id,
            mappingsSSO: [],
            name: group.name,
            rootRole: null,
        },
    });

    expect.assertions(3);
});

test('adding a nonexistent role to a group should fail', async () => {
    const group = await groupStore.create({
        name: 'root_group',
        description: 'root_group',
    });

    await expect(() => {
        return groupService.updateGroup(
            {
                id: group.id,
                name: group.name,
                users: [],
                rootRole: 100,
                createdAt: new Date(),
                createdBy: 'test',
            },
            TEST_AUDIT_USER,
        );
    }).rejects.toThrow(
        'Request validation failed: your request body or params contain invalid data: Incorrect role id 100',
    );
});

test('trying to modify a SCIM group name should fail', async () => {
    const group = await groupStore.create({
        name: 'scim_group',
        description: 'scim_group',
    });

    await db.rawDatabase('groups').where({ id: group.id }).update({
        scim_id: 'some-faux-uuid',
        scim_external_id: 'external-id',
    });

    await expect(() => {
        return groupService.updateGroup(
            {
                id: group.id,
                name: 'new_name',
                users: [],
                rootRole: 100,
                createdAt: new Date(),
                createdBy: 'test',
            },
            TEST_AUDIT_USER,
        );
    }).rejects.toThrow(
        'Request validation failed: your request body or params contain invalid data: Cannot update the name of a SCIM group',
    );
});

test('trying to modify users in a SCIM group should fail', async () => {
    const group = await groupStore.create({
        name: 'another_scim_group',
        description: 'scim_group',
    });

    await db.rawDatabase('groups').where({ id: group.id }).update({
        scim_id: 'some-other-faux-uuid',
        scim_external_id: 'some-external-id',
    });

    await expect(() => {
        return groupService.updateGroup(
            {
                id: group.id,
                name: 'new_name',
                users: [
                    {
                        user: {
                            id: 1,
                            isAPI: false,
                            permissions: [],
                        },
                    },
                ],
                rootRole: 100,
                createdAt: new Date(),
                createdBy: 'test',
            },
            TEST_AUDIT_USER,
        );
    }).rejects.toThrow(
        'Request validation failed: your request body or params contain invalid data: Cannot update the name of a SCIM group',
    );
});

test('can modify a SCIM group description and root role', async () => {
    const group = await groupStore.create({
        name: 'yet_another_scim_group',
        description: 'scim_group',
    });

    await db.rawDatabase('groups').where({ id: group.id }).update({
        scim_id: 'completely-different-faux-uuid',
        scim_external_id: 'totally-not-the-same-external-id',
    });

    await groupService.updateGroup(
        {
            id: group.id,
            name: 'yet_another_scim_group',
            description: 'new description',
            users: [],
            rootRole: 1,
            createdAt: new Date(),
            createdBy: 'test',
        },
        TEST_AUDIT_USER,
    );

    const updatedGroup = await groupService.getGroup(group.id);
    expect(updatedGroup).toMatchObject({
        description: 'new description',
        id: group.id,
        mappingsSSO: [],
        name: 'yet_another_scim_group',
        rootRole: 1,
    });
});
