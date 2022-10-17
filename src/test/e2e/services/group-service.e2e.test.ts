import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { createTestConfig } from '../../config/test-config';
import { GroupService } from '../../../lib/services/group-service';
import GroupStore from '../../../lib/db/group-store';

let stores;
let db: ITestDb;

let groupService: GroupService;
let groupStore: GroupStore;
let user;

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
    groupService = new GroupService(stores, config);
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

test('should have three group', async () => {
    const project = await groupService.getAll();
    expect(project.length).toBe(3);
});

test('should add person to 2 groups', async () => {
    await groupService.syncExternalGroups(user.id, ['dev', 'maintainer']);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(2);
});

test('should remove person from one group', async () => {
    await groupService.syncExternalGroups(user.id, ['maintainer']);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(1);
    expect(groups[0].name).toEqual('maintainer_group');
});

test('should add person to completely new group with new name', async () => {
    await groupService.syncExternalGroups(user.id, ['dev']);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(1);
    expect(groups[0].name).toEqual('dev_group');
});

test('should not update groups when not string array ', async () => {
    await groupService.syncExternalGroups(user.id, 'Everyone' as any);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(1);
    expect(groups[0].name).toEqual('dev_group');
});

test('should clear groups when empty array ', async () => {
    await groupService.syncExternalGroups(user.id, []);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(0);
});

test('should not remove user from no SSO definition group', async () => {
    const group = await groupStore.create({
        name: 'no_mapping_group',
        description: 'no_mapping_group',
    });
    await groupStore.addUserToGroups(user.id, [group.id]);
    await groupService.syncExternalGroups(user.id, []);
    const groups = await groupService.getGroupsForUser(user.id);
    expect(groups.length).toBe(1);
    expect(groups[0].name).toEqual('no_mapping_group');
});
