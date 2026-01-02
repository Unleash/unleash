import {
    createGetReadOnlyUsers,
    type GetReadOnlyUsers,
} from './getReadOnlyUsers.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { RoleName } from '../../types/model.js';
import {
    ALL_PROJECTS,
    PROJECT_ROLE_TYPE,
    ROOT_ROLE_TYPE,
} from '../../util/constants.js';
import { FEATURE_CREATED, FEATURE_FAVORITED } from '../../events/index.js';

let db: ITestDb;
let getReadOnlyUsers: GetReadOnlyUsers;
let viewerRootRoleId: number;
let adminRootRoleId: number;
let ownerProjectRoleId: number;
let userCounter = 0;
let groupCounter = 0;

const getRoleId = async (name: RoleName, type: string) => {
    const role = await db
        .rawDatabase('roles')
        .where({ name, type })
        .first('id');

    if (!role) {
        throw new Error(`Missing role ${name} (${type})`);
    }

    return role.id as number;
};

const insertUser = async (
    overrides: Record<string, unknown> = {},
): Promise<{ id: number }> => {
    const [user] = await db
        .rawDatabase('users')
        .insert({
            email: `viewer${++userCounter}@example.com`,
            name: `Viewer ${userCounter}`,
            is_system: false,
            is_service: false,
            ...overrides,
        })
        .returning('id');

    return user as { id: number };
};

const assignRoleToUser = async (
    userId: number,
    roleId: number,
    project: string = ALL_PROJECTS,
) => {
    await db.rawDatabase('role_user').insert({
        role_id: roleId,
        user_id: userId,
        project,
        created_at: new Date(),
    });
};

const createViewer = async (overrides: Record<string, unknown> = {}) => {
    const user = await insertUser(overrides);
    await assignRoleToUser(user.id, viewerRootRoleId);
    return user;
};

const createGroup = async (
    overrides: Record<string, unknown> = {},
): Promise<{ id: number }> => {
    const [group] = await db
        .rawDatabase('groups')
        .insert({
            name: `group-${++groupCounter}`,
            created_at: new Date(),
            ...overrides,
        })
        .returning('id');

    return group as { id: number };
};

const addUserToGroup = async (userId: number, groupId: number) => {
    await db.rawDatabase('group_user').insert({
        group_id: groupId,
        user_id: userId,
        created_at: new Date(),
    });
};

const assignGroupRole = async (
    groupId: number,
    roleId: number,
    project: string = ALL_PROJECTS,
) => {
    await db.rawDatabase('group_role').insert({
        group_id: groupId,
        role_id: roleId,
        project,
        created_at: new Date(),
    });
};

const addEventForUser = async (userId: number, type: string) => {
    await db.rawDatabase('events').insert({
        type,
        created_by_user_id: userId,
        created_by: 'readonly-test',
        project: 'default',
        environment: 'development',
        data: '{}',
        created_at: new Date(),
    });
};

beforeAll(async () => {
    db = await dbInit('read_only_users_serial', getLogger);
    getReadOnlyUsers = createGetReadOnlyUsers(db.rawDatabase);

    viewerRootRoleId = await getRoleId(RoleName.VIEWER, ROOT_ROLE_TYPE);
    adminRootRoleId = await getRoleId(RoleName.ADMIN, ROOT_ROLE_TYPE);
    ownerProjectRoleId = await getRoleId(RoleName.OWNER, PROJECT_ROLE_TYPE);
});

afterEach(async () => {
    await db.rawDatabase('events').delete();
    await db.rawDatabase('group_role').delete();
    await db.rawDatabase('group_user').delete();
    await db.rawDatabase('groups').delete();
    await db.rawDatabase('role_user').delete();
    await db.rawDatabase('users').delete();
});

afterAll(async () => {
    await db.destroy();
});

test('counts viewer without write events or permissions', async () => {
    const viewer = await createViewer();
    await addEventForUser(viewer.id, FEATURE_FAVORITED);

    await expect(getReadOnlyUsers()).resolves.toEqual(1);
});

test('counts multiple viewers that satisfy read-only conditions', async () => {
    await createViewer();
    await createViewer();

    await expect(getReadOnlyUsers()).resolves.toEqual(2);
});

test('ignores deleted, system, and service viewers', async () => {
    await createViewer();
    await createViewer({ is_system: true });
    await createViewer({ is_service: true });
    await createViewer({ deleted_at: new Date() });

    await expect(getReadOnlyUsers()).resolves.toEqual(1);
});

test('ignores viewers with additional root permissions', async () => {
    await createViewer();
    const userWithAdmin = await createViewer();
    await assignRoleToUser(userWithAdmin.id, adminRootRoleId);

    await expect(getReadOnlyUsers()).resolves.toEqual(1);
});

test('ignores viewers with project role permissions', async () => {
    await createViewer();
    const userWithProjectRole = await createViewer();
    await assignRoleToUser(
        userWithProjectRole.id,
        ownerProjectRoleId,
        'default',
    );

    await expect(getReadOnlyUsers()).resolves.toEqual(1);
});

test('ignores viewers with permissions inherited from group project roles', async () => {
    await createViewer();
    const userWithGroupProjectPermissions = await createViewer();
    const group = await createGroup();
    await addUserToGroup(userWithGroupProjectPermissions.id, group.id);
    await assignGroupRole(group.id, ownerProjectRoleId, 'default');

    await expect(getReadOnlyUsers()).resolves.toEqual(1);
});

test('ignores viewers with permissions inherited from group root roles', async () => {
    await createViewer();
    const userWithGroupRootPermissions = await createViewer();
    const group = await createGroup({ root_role_id: adminRootRoleId });
    await addUserToGroup(userWithGroupRootPermissions.id, group.id);

    await expect(getReadOnlyUsers()).resolves.toEqual(1);
});

test('counts viewers with no permissions inherited from group root roles', async () => {
    await createViewer();
    const userWithGroupRootPermissions = await createViewer();
    const group = await createGroup({ root_role_id: viewerRootRoleId });
    await addUserToGroup(userWithGroupRootPermissions.id, group.id);

    await expect(getReadOnlyUsers()).resolves.toEqual(2);
});

test('ignores viewers with write events', async () => {
    await createViewer();
    const userWithWriteEvent = await createViewer();
    await addEventForUser(userWithWriteEvent.id, FEATURE_CREATED);

    await expect(getReadOnlyUsers()).resolves.toEqual(1);
});
