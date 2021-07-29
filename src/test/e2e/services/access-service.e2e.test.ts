import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

// eslint-disable-next-line import/no-unresolved
import {
    AccessService,
    ALL_PROJECTS,
} from '../../../lib/services/access-service';

import * as permissions from '../../../lib/types/permissions';
import { RoleName } from '../../../lib/types/model';

let db;
let stores;
let accessService;

let editorUser;
let superUser;
let editorRole;
let adminRole;
let readRole;

const createUserEditorAccess = async (name, email) => {
    const { userStore } = stores;
    const user = await userStore.insert({ name, email });
    await accessService.addUserToRole(user.id, editorRole.id);
    return user;
};

const createSuperUser = async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Alice Admin',
        email: 'admin@getunleash.io',
    });
    await accessService.addUserToRole(user.id, adminRole.id);
    return user;
};

beforeAll(async () => {
    db = await dbInit('access_service_serial', getLogger);
    stores = db.stores;
    // projectStore = stores.projectStore;
    accessService = new AccessService(stores, { getLogger });
    const roles = await accessService.getRootRoles();
    editorRole = roles.find((r) => r.name === RoleName.EDITOR);
    adminRole = roles.find((r) => r.name === RoleName.ADMIN);
    readRole = roles.find((r) => r.name === RoleName.VIEWER);

    editorUser = await createUserEditorAccess('Bob Test', 'bob@getunleash.io');
    superUser = await createSuperUser();
});

afterAll(async () => {
    await db.destroy();
});

test('should have access to admin addons', async () => {
    const { CREATE_ADDON, UPDATE_ADDON, DELETE_ADDON } = permissions;
    const user = editorUser;
    expect(await accessService.hasPermission(user, CREATE_ADDON)).toBe(true);
    expect(await accessService.hasPermission(user, UPDATE_ADDON)).toBe(true);
    expect(await accessService.hasPermission(user, DELETE_ADDON)).toBe(true);
});

test('should have access to admin strategies', async () => {
    const { CREATE_STRATEGY, UPDATE_STRATEGY, DELETE_STRATEGY } = permissions;
    const user = editorUser;
    expect(await accessService.hasPermission(user, CREATE_STRATEGY)).toBe(true);
    expect(await accessService.hasPermission(user, UPDATE_STRATEGY)).toBe(true);
    expect(await accessService.hasPermission(user, DELETE_STRATEGY)).toBe(true);
});

test('should have access to admin contexts', async () => {
    const { CREATE_CONTEXT_FIELD, UPDATE_CONTEXT_FIELD, DELETE_CONTEXT_FIELD } =
        permissions;
    const user = editorUser;
    expect(await accessService.hasPermission(user, CREATE_CONTEXT_FIELD)).toBe(
        true,
    );
    expect(await accessService.hasPermission(user, UPDATE_CONTEXT_FIELD)).toBe(
        true,
    );
    expect(await accessService.hasPermission(user, DELETE_CONTEXT_FIELD)).toBe(
        true,
    );
});

test('should have access to create projects', async () => {
    const { CREATE_PROJECT } = permissions;
    const user = editorUser;
    expect(await accessService.hasPermission(user, CREATE_PROJECT)).toBe(true);
});

test('should have access to update applications', async () => {
    const { UPDATE_APPLICATION } = permissions;
    const user = editorUser;
    expect(await accessService.hasPermission(user, UPDATE_APPLICATION)).toBe(
        true,
    );
});

test('should not have admin permission', async () => {
    const { ADMIN } = permissions;
    const user = editorUser;
    expect(await accessService.hasPermission(user, ADMIN)).toBe(false);
});

test('should have project admin to default project', async () => {
    const {
        DELETE_PROJECT,
        UPDATE_PROJECT,
        CREATE_FEATURE,
        UPDATE_FEATURE,
        DELETE_FEATURE,
    } = permissions;
    const user = editorUser;
    expect(
        await accessService.hasPermission(user, DELETE_PROJECT, 'default'),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, UPDATE_PROJECT, 'default'),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, CREATE_FEATURE, 'default'),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, UPDATE_FEATURE, 'default'),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, DELETE_FEATURE, 'default'),
    ).toBe(true);
});

test('should grant member CREATE_FEATURE on all projects', async () => {
    const { CREATE_FEATURE } = permissions;
    const user = editorUser;

    await accessService.addPermissionToRole(
        editorRole.id,
        permissions.CREATE_FEATURE,
        ALL_PROJECTS,
    );

    expect(
        await accessService.hasPermission(user, CREATE_FEATURE, 'some-project'),
    ).toBe(true);
});

test('cannot add CREATE_FEATURE without defining project', async () => {
    await expect(async () => {
        await accessService.addPermissionToRole(
            editorRole.id,
            permissions.CREATE_FEATURE,
        );
    }).rejects.toThrow(
        new Error('ProjectId cannot be empty for permission=CREATE_FEATURE'),
    );
});

test('cannot remove CREATE_FEATURE without defining project', async () => {
    await expect(async () => {
        await accessService.removePermissionFromRole(
            editorRole.id,
            permissions.CREATE_FEATURE,
        );
    }).rejects.toThrow(
        new Error('ProjectId cannot be empty for permission=CREATE_FEATURE'),
    );
});

test('should remove CREATE_FEATURE on all projects', async () => {
    const { CREATE_FEATURE } = permissions;
    const user = editorUser;

    await accessService.addPermissionToRole(
        editorRole.id,
        permissions.CREATE_FEATURE,
        ALL_PROJECTS,
    );

    await accessService.removePermissionFromRole(
        editorRole.id,
        permissions.CREATE_FEATURE,
        ALL_PROJECTS,
    );

    expect(
        await accessService.hasPermission(user, CREATE_FEATURE, 'some-project'),
    ).toBe(false);
});

test('admin should be admin', async () => {
    const {
        DELETE_PROJECT,
        UPDATE_PROJECT,
        CREATE_FEATURE,
        UPDATE_FEATURE,
        DELETE_FEATURE,
        ADMIN,
    } = permissions;
    const user = superUser;
    expect(
        await accessService.hasPermission(user, DELETE_PROJECT, 'default'),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, UPDATE_PROJECT, 'default'),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, CREATE_FEATURE, 'default'),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, UPDATE_FEATURE, 'default'),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, DELETE_FEATURE, 'default'),
    ).toBe(true);
    expect(await accessService.hasPermission(user, ADMIN)).toBe(true);
});

test('should create default roles to project', async () => {
    const {
        DELETE_PROJECT,
        UPDATE_PROJECT,
        CREATE_FEATURE,
        UPDATE_FEATURE,
        DELETE_FEATURE,
    } = permissions;
    const project = 'some-project';
    const user = editorUser;
    await accessService.createDefaultProjectRoles(user, project);
    expect(
        await accessService.hasPermission(user, UPDATE_PROJECT, project),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, DELETE_PROJECT, project),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, CREATE_FEATURE, project),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, UPDATE_FEATURE, project),
    ).toBe(true);
    expect(
        await accessService.hasPermission(user, DELETE_FEATURE, project),
    ).toBe(true);
});

test('should require name when create default roles to project', async () => {
    await expect(async () => {
        await accessService.createDefaultProjectRoles(editorUser);
    }).rejects.toThrow(new Error('ProjectId cannot be empty'));
});

test('should grant user access to project', async () => {
    const {
        DELETE_PROJECT,
        UPDATE_PROJECT,
        CREATE_FEATURE,
        UPDATE_FEATURE,
        DELETE_FEATURE,
    } = permissions;
    const project = 'another-project';
    const user = editorUser;
    const sUser = await createUserEditorAccess(
        'Some Random',
        'random@getunleash.io',
    );
    await accessService.createDefaultProjectRoles(user, project);

    const roles = await accessService.getRolesForProject(project);

    const projectRole = roles.find(
        (r) => r.name === 'Member' && r.project === project,
    );
    await accessService.addUserToRole(sUser.id, projectRole.id);

    // Should be able to update feature toggles inside the project
    expect(
        await accessService.hasPermission(sUser, CREATE_FEATURE, project),
    ).toBe(true);
    expect(
        await accessService.hasPermission(sUser, UPDATE_FEATURE, project),
    ).toBe(true);
    expect(
        await accessService.hasPermission(sUser, DELETE_FEATURE, project),
    ).toBe(true);

    // Should not be able to admin the project itself.
    expect(
        await accessService.hasPermission(sUser, UPDATE_PROJECT, project),
    ).toBe(false);
    expect(
        await accessService.hasPermission(sUser, DELETE_PROJECT, project),
    ).toBe(false);
});

test('should not get access if not specifying project', async () => {
    const { CREATE_FEATURE, UPDATE_FEATURE, DELETE_FEATURE } = permissions;
    const project = 'another-project-2';
    const user = editorUser;
    const sUser = await createUserEditorAccess(
        'Some Random',
        'random22@getunleash.io',
    );
    await accessService.createDefaultProjectRoles(user, project);

    const roles = await accessService.getRolesForProject(project);

    const projectRole = roles.find(
        (r) => r.name === 'Member' && r.project === project,
    );
    await accessService.addUserToRole(sUser.id, projectRole.id);

    // Should not be able to update feature toggles outside project
    expect(await accessService.hasPermission(sUser, CREATE_FEATURE)).toBe(
        false,
    );
    expect(await accessService.hasPermission(sUser, UPDATE_FEATURE)).toBe(
        false,
    );
    expect(await accessService.hasPermission(sUser, DELETE_FEATURE)).toBe(
        false,
    );
});

test('should remove user from role', async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email: 'random123@getunleash.io',
    });

    await accessService.addUserToRole(user.id, editorRole.id);

    // check user has one role
    const userRoles = await accessService.getRolesForUser(user.id);
    expect(userRoles.length).toBe(1);
    expect(userRoles[0].name).toBe(RoleName.EDITOR);

    await accessService.removeUserFromRole(user.id, editorRole.id);
    const userRolesAfterRemove = await accessService.getRolesForUser(user.id);
    expect(userRolesAfterRemove.length).toBe(0);
});

test('should return role with users', async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email: 'random2223@getunleash.io',
    });

    await accessService.addUserToRole(user.id, editorRole.id);

    const roleWithUsers = await accessService.getRole(editorRole.id);

    expect(roleWithUsers.role.name).toBe(RoleName.EDITOR);
    expect(roleWithUsers.users.length > 2).toBe(true);
    expect(roleWithUsers.users.find((u) => u.id === user.id)).toBeTruthy();
    expect(
        roleWithUsers.users.find((u) => u.email === user.email),
    ).toBeTruthy();
});

test('should return role with permissions and users', async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email: 'random2244@getunleash.io',
    });

    await accessService.addUserToRole(user.id, editorRole.id);

    const roleWithPermission = await accessService.getRole(editorRole.id);

    expect(roleWithPermission.role.name).toBe(RoleName.EDITOR);
    expect(roleWithPermission.permissions.length > 2).toBe(true);
    expect(
        roleWithPermission.permissions.find(
            (p) => p.permission === permissions.CREATE_PROJECT,
        ),
    ).toBeTruthy();
    expect(roleWithPermission.users.length > 2).toBe(true);
});

test('should return list of permissions', async () => {
    const p = await accessService.getPermissions();

    const findPerm = (perm) => p.find((_) => _.name === perm);

    const {
        DELETE_FEATURE,
        UPDATE_FEATURE,
        CREATE_FEATURE,
        UPDATE_PROJECT,
        CREATE_PROJECT,
    } = permissions;

    expect(p.length > 2).toBe(true);
    expect(findPerm(CREATE_PROJECT).type).toBe('root');
    expect(findPerm(UPDATE_PROJECT).type).toBe('project');
    expect(findPerm(CREATE_FEATURE).type).toBe('project');
    expect(findPerm(UPDATE_FEATURE).type).toBe('project');
    expect(findPerm(DELETE_FEATURE).type).toBe('project');
});

test('should set root role for user', async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email: 'random2255@getunleash.io',
    });

    await accessService.setUserRootRole(user.id, editorRole.id);

    const roles = await accessService.getRolesForUser(user.id);

    expect(roles.length).toBe(1);
    expect(roles[0].name).toBe(RoleName.EDITOR);
});

test('should switch root role for user', async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email: 'random22Read@getunleash.io',
    });

    await accessService.setUserRootRole(user.id, editorRole.id);
    await accessService.setUserRootRole(user.id, readRole.id);

    const roles = await accessService.getRolesForUser(user.id);

    expect(roles.length).toBe(1);
    expect(roles[0].name).toBe(RoleName.VIEWER);
});

test('should not crash if user does not have permission', async () => {
    const { userStore } = stores;

    const user = await userStore.insert({
        name: 'Some User',
        email: 'random55Read@getunleash.io',
    });

    await accessService.setUserRootRole(user.id, readRole.id);

    const { UPDATE_CONTEXT_FIELD } = permissions;
    const hasAccess = await accessService.hasPermission(
        user,
        UPDATE_CONTEXT_FIELD,
    );

    expect(hasAccess).toBe(false);
});
