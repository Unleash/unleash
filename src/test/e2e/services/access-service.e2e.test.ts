import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';

import type {
    AccessService,
    IRoleUpdate,
    PermissionRef,
} from '../../../lib/services/access-service.js';

import * as permissions from '../../../lib/types/permissions.js';
import { RoleName } from '../../../lib/types/model.js';
import {
    type ICreateGroupUserModel,
    type IUnleashStores,
    type IUser,
    type IUserAccessOverview,
    SYSTEM_USER_AUDIT,
    TEST_AUDIT_USER,
} from '../../../lib/types/index.js';
import { createTestConfig } from '../../config/test-config.js';
import { DEFAULT_PROJECT } from '../../../lib/types/project.js';
import {
    ALL_PROJECTS,
    CUSTOM_ROOT_ROLE_TYPE,
    DEFAULT_ENV,
} from '../../../lib/util/constants.js';
import {
    createAccessService,
    createFeatureToggleService,
    createProjectService,
} from '../../../lib/features/index.js';
import { BadDataError } from '../../../lib/error/index.js';
import type { FeatureToggleService } from '../../../lib/features/feature-toggle/feature-toggle-service.js';
import type { ProjectService } from '../../../lib/services/index.js';
import type { IRole } from '../../../lib/types/stores/access-store.js';
import { extractAuditInfoFromUser } from '../../../lib/util/index.js';

let db: ITestDb;
let stores: IUnleashStores;
let accessService: AccessService;
let featureToggleService: FeatureToggleService;
let projectService: ProjectService;
let editorUser: IUser;
let editorRole: IRole;
let adminRole: IRole;
let readRole: IRole;

let userIndex = 0;
const TEST_USER_ID = -9999;
const createUser = async (role?: number) => {
    const name = `User ${userIndex}`;
    const email = `user-${userIndex}@getunleash.io`;
    userIndex++;

    const { userStore } = stores;
    const user = await userStore.insert({ name, email });
    if (role)
        await accessService.addUserToRole(
            user.id,
            role,
            role === readRole.id ? ALL_PROJECTS : DEFAULT_PROJECT,
        );
    return user;
};

const groupIndex = 0;
const createGroup = async ({
    users,
    role,
}: {
    users: ICreateGroupUserModel[];
    role?: number;
}) => {
    const { groupStore } = stores;
    const group = await stores.groupStore.create({
        name: `Group ${groupIndex}`,
        rootRole: role,
    });
    if (users) await groupStore.addUsersToGroup(group.id, users, 'Admin');
    return group;
};

let roleIndex = 0;
const createRole = async (rolePermissions: PermissionRef[]) => {
    return accessService.createRole(
        {
            name: `Role ${roleIndex}`,
            description: `Role ${roleIndex++} description`,
            permissions: rolePermissions,
            createdByUserId: TEST_USER_ID,
        },
        SYSTEM_USER_AUDIT,
    );
};

const hasCommonProjectAccess = async (user, projectName, condition) => {
    const defaultEnv = DEFAULT_ENV;

    const {
        CREATE_FEATURE,
        UPDATE_FEATURE,
        DELETE_FEATURE,
        CREATE_FEATURE_STRATEGY,
        UPDATE_FEATURE_STRATEGY,
        DELETE_FEATURE_STRATEGY,
        UPDATE_FEATURE_ENVIRONMENT,
        UPDATE_FEATURE_VARIANTS,
    } = permissions;
    expect(
        await accessService.hasPermission(user, CREATE_FEATURE, projectName),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(user, UPDATE_FEATURE, projectName),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(user, DELETE_FEATURE, projectName),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            UPDATE_FEATURE_VARIANTS,
            projectName,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            CREATE_FEATURE_STRATEGY,
            projectName,
            defaultEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            UPDATE_FEATURE_STRATEGY,
            projectName,
            defaultEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            DELETE_FEATURE_STRATEGY,
            projectName,
            defaultEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            UPDATE_FEATURE_ENVIRONMENT,
            projectName,
            defaultEnv,
        ),
    ).toBe(condition);
};

const hasFullProjectAccess = async (user, projectName: string, condition) => {
    const { DELETE_PROJECT, UPDATE_PROJECT, MOVE_FEATURE_TOGGLE } = permissions;

    expect(
        await accessService.hasPermission(user, DELETE_PROJECT, projectName),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(user, UPDATE_PROJECT, projectName),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            MOVE_FEATURE_TOGGLE,
            projectName,
        ),
    );
    await hasCommonProjectAccess(user, projectName, condition);
};

beforeAll(async () => {
    db = await dbInit('access_service_serial', getLogger);
    stores = db.stores;
    // projectStore = stores.projectStore;
    const config = createTestConfig({
        getLogger,
        // @ts-ignore
        experimental: { environments: { enabled: true } },
    });
    accessService = createAccessService(db.rawDatabase, config);
    const roles = await accessService.getRootRoles();
    editorRole = roles.find((r) => r.name === RoleName.EDITOR)!;
    adminRole = roles.find((r) => r.name === RoleName.ADMIN)!;
    readRole = roles.find((r) => r.name === RoleName.VIEWER)!;

    featureToggleService = createFeatureToggleService(db.rawDatabase, config);
    projectService = createProjectService(db.rawDatabase, config);

    editorUser = await createUser(editorRole.id);

    const testAdmin = await createUser(adminRole.id);
    await projectService.createProject(
        {
            id: 'some-project',
            name: 'Some project',
        },
        testAdmin,
        TEST_AUDIT_USER,
    );

    await projectService.createProject(
        {
            id: 'unusedprojectname',
            name: 'Another project not used',
        },
        testAdmin,
        TEST_AUDIT_USER,
    );
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

test('should have project admin to default project as editor', async () => {
    const projectName = 'default';

    const user = editorUser;
    await hasFullProjectAccess(user, projectName, true);
});

test('should not have project admin to other projects as editor', async () => {
    const projectName = 'unusedprojectname';
    const user = editorUser;
    await hasFullProjectAccess(user, projectName, false);
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

test('should remove CREATE_FEATURE on default environment', async () => {
    const { CREATE_FEATURE } = permissions;
    const user = editorUser;
    const editRole = await accessService.getRoleByName(RoleName.EDITOR);

    await accessService.addPermissionToRole(
        editRole.id,
        permissions.CREATE_FEATURE,
        DEFAULT_ENV,
    );

    // TODO: to validate the remove works, we should make sure that we had permission before removing it
    // this currently does not work, just keeping the comment here for future reference
    // expect(
    //     await accessService.hasPermission(user, CREATE_FEATURE, 'some-project'),
    // ).toBe(true);

    await accessService.removePermissionFromRole(
        editRole.id,
        permissions.CREATE_FEATURE,
        '*',
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
    const user = await createUser(adminRole.id);
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
    const project = 'some-project';
    const user = editorUser;
    await accessService.createDefaultProjectRoles(user, project);
    await hasFullProjectAccess(user, project, true);
});

test('should require name when create default roles to project', async () => {
    await expect(async () => {
        // @ts-ignore
        await accessService.createDefaultProjectRoles(editorUser);
    }).rejects.toThrow(new Error('ProjectId cannot be empty'));
});

test('should grant user access to project', async () => {
    const { DELETE_PROJECT, UPDATE_PROJECT } = permissions;
    const project = 'another-project';
    const user = editorUser;
    const sUser = await createUser(readRole.id);
    await accessService.createDefaultProjectRoles(user, project);

    const projectRole = await accessService.getRoleByName(RoleName.MEMBER);
    await accessService.addUserToRole(sUser.id, projectRole.id, project);

    // // Should be able to update feature flags inside the project
    await hasCommonProjectAccess(sUser, project, true);

    // Should not be able to admin the project itself.
    expect(
        await accessService.hasPermission(sUser, UPDATE_PROJECT, project),
    ).toBe(false);
    expect(
        await accessService.hasPermission(sUser, DELETE_PROJECT, project),
    ).toBe(false);
});

test('should not get access if not specifying project', async () => {
    const project = 'another-project-2';
    const user = editorUser;
    const sUser = await createUser(readRole.id);
    await accessService.createDefaultProjectRoles(user, project);

    const projectRole = await accessService.getRoleByName(RoleName.MEMBER);

    await accessService.addUserToRole(sUser.id, projectRole.id, project);

    // Should not be able to update feature flags outside project
    await hasCommonProjectAccess(sUser, undefined, false);
});

test('should remove user from role', async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email: 'random123@getunleash.io',
    });

    await accessService.addUserToRole(user.id, editorRole.id, 'default');

    // check user has one role
    const userRoles = await accessService.getRolesForUser(user.id);
    expect(userRoles.length).toBe(1);
    expect(userRoles[0].name).toBe(RoleName.EDITOR);

    await accessService.removeUserFromRole(user.id, editorRole.id, 'default');
    const userRolesAfterRemove = await accessService.getRolesForUser(user.id);
    expect(userRolesAfterRemove.length).toBe(0);
});

test('should return role with users', async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email: 'random2223@getunleash.io',
    });

    await accessService.addUserToRole(user.id, editorRole.id, 'default');

    const roleWithUsers = await accessService.getRoleData(editorRole.id);
    expect(roleWithUsers.role.name).toBe(RoleName.EDITOR);
    expect(roleWithUsers.users.length >= 2).toBe(true);
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

    await accessService.addUserToRole(user.id, editorRole.id, 'default');

    const roleWithPermission = await accessService.getRoleData(editorRole.id);

    expect(roleWithPermission.role.name).toBe(RoleName.EDITOR);
    expect(roleWithPermission.permissions.length > 2).toBe(true);
    expect(
        roleWithPermission.permissions.find(
            (p) => p.name === permissions.CREATE_PROJECT,
        ),
    ).toBeTruthy();
    //This assert requires other tests to have run in this pack before length > 2 resolves to true
    // I've set this to be > 1, which allows us to run the test alone and should still satisfy the logic requirement
    expect(roleWithPermission.users.length > 1).toBe(true);
});

test('should set root role for user', async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email: 'random2255@getunleash.io',
    });

    await accessService.setUserRootRole(user.id, editorRole.id);

    const roles = await accessService.getRolesForUser(user.id);
    //To have duplicated roles like this may not may not be a hack. Needs some thought
    expect(roles[0].name).toBe(RoleName.EDITOR);

    expect(roles.length).toBe(1);
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

test('should switch project roles on when multiple roles are present for same user', async () => {
    const { userStore, roleStore, accessStore } = stores;

    const userOne = await userStore.insert({
        name: 'Some User With Expected Roles',
        email: 'random42Read@getunleash.io',
    });

    const customRole = await roleStore.create({
        name: 'Some Arbitrary Role',
        roleType: 'custom',
        description: 'This does nothing',
    });

    const targetRole = await roleStore.create({
        name: 'Another Arbitrary Role',
        roleType: 'custom',
        description: 'This does nothing',
    });

    await accessService.setUserRootRole(userOne.id, editorRole.id);
    await accessStore.addUserToRole(userOne.id, customRole.id, DEFAULT_PROJECT);

    await accessService.updateUserProjectRole(
        userOne.id,
        targetRole.id,
        DEFAULT_PROJECT,
    );
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

test('should support permission with "ALL" environment requirement', async () => {
    const { userStore, roleStore, accessStore } = stores;

    const user = await userStore.insert({
        name: 'Some User',
        email: 'randomEnv1@getunleash.io',
    });

    await accessService.setUserRootRole(user.id, readRole.id);

    const customRole = await roleStore.create({
        name: 'Power user',
        roleType: 'custom',
        description: 'Grants access to modify all environments',
    });

    const { CREATE_FEATURE_STRATEGY } = permissions;
    await accessStore.addPermissionsToRole(
        customRole.id,
        [{ name: CREATE_FEATURE_STRATEGY }],
        DEFAULT_ENV,
    );
    await accessStore.addUserToRole(user.id, customRole.id, ALL_PROJECTS);

    const hasAccess = await accessService.hasPermission(
        user,
        CREATE_FEATURE_STRATEGY,
        'default',
        DEFAULT_ENV,
    );

    expect(hasAccess).toBe(true);

    const hasNotAccess = await accessService.hasPermission(
        user,
        CREATE_FEATURE_STRATEGY,
        'default',
        'production',
    );
    expect(hasNotAccess).toBe(false);
});

test('Should have access to create a strategy in an environment', async () => {
    const { CREATE_FEATURE_STRATEGY } = permissions;
    const user = editorUser;
    expect(
        await accessService.hasPermission(
            user,
            CREATE_FEATURE_STRATEGY,
            'default',
            DEFAULT_ENV,
        ),
    ).toBe(true);
});

test('Should be denied access to create a strategy in an environment the user does not have access to', async () => {
    const { CREATE_FEATURE_STRATEGY } = permissions;
    const user = editorUser;
    expect(
        await accessService.hasPermission(
            user,
            CREATE_FEATURE_STRATEGY,
            'default',
            'noaccess',
        ),
    ).toBe(false);
});

test('Should have access to edit a strategy in an environment', async () => {
    const { UPDATE_FEATURE_STRATEGY } = permissions;
    const user = editorUser;
    expect(
        await accessService.hasPermission(
            user,
            UPDATE_FEATURE_STRATEGY,
            'default',
            DEFAULT_ENV,
        ),
    ).toBe(true);
});

test('Should have access to delete a strategy in an environment', async () => {
    const { DELETE_FEATURE_STRATEGY } = permissions;
    const user = editorUser;
    expect(
        await accessService.hasPermission(
            user,
            DELETE_FEATURE_STRATEGY,
            'default',
            DEFAULT_ENV,
        ),
    ).toBe(true);
});

test('Should be denied access to delete a strategy in an environment the user does not have access to', async () => {
    const { DELETE_FEATURE_STRATEGY } = permissions;
    const user = editorUser;
    expect(
        await accessService.hasPermission(
            user,
            DELETE_FEATURE_STRATEGY,
            'default',
            'noaccess',
        ),
    ).toBe(false);
});

test('Should be denied access to delete a role that is in use', async () => {
    const user = editorUser;

    const project = {
        id: 'projectToUseRole',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user, TEST_AUDIT_USER);

    const projectMember = await stores.userStore.insert({
        name: 'CustomProjectMember',
        email: 'custom@getunleash.io',
    });

    const customRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);

    await projectService.addAccess(
        project.id,
        [customRole.id],
        [], // no groups
        [projectMember.id],
        SYSTEM_USER_AUDIT,
    );

    try {
        await accessService.deleteRole(customRole.id, TEST_AUDIT_USER);
    } catch (e) {
        expect(e.toString()).toBe(
            'RoleInUseError: Role is in use by users(1) or groups(0). You cannot delete a role that is in use without first removing the role from the users and groups.',
        );
    }
});

test('Should be denied move feature flag to project where the user does not have access', async () => {
    const user = editorUser;
    const editorUser2 = await createUser(editorRole.id);

    const projectOrigin = {
        id: 'projectOrigin',
        name: 'New project',
        description: 'Blah',
    };
    const projectDest = {
        id: 'projectDest',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(projectOrigin, user, TEST_AUDIT_USER);
    await projectService.createProject(
        projectDest,
        editorUser2,
        TEST_AUDIT_USER,
    );

    const featureFlag = { name: 'moveableFlag' };

    await featureToggleService.createFeatureToggle(
        projectOrigin.id,
        featureFlag,
        extractAuditInfoFromUser(user),
    );

    try {
        await projectService.changeProject(
            projectDest.id,
            featureFlag.name,
            user,
            projectOrigin.id,
            TEST_AUDIT_USER,
        );
    } catch (e) {
        expect(e.name).toContain('Permission');
        expect(e.message.includes('permission')).toBeTruthy();
        expect(
            e.message.includes(permissions.MOVE_FEATURE_TOGGLE),
        ).toBeTruthy();
    }
});

test('Should be allowed move feature flag to project when the user has access', async () => {
    const user = editorUser;

    const projectOrigin = {
        id: 'projectOrigin1',
        name: 'New project',
        description: 'Blah',
    };
    const projectDest = {
        id: 'projectDest2',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(
        projectOrigin,
        user,
        extractAuditInfoFromUser(user),
    );
    await projectService.createProject(
        projectDest,
        user,
        extractAuditInfoFromUser(user),
    );

    const featureFlag = { name: 'moveableFlag2' };

    await featureToggleService.createFeatureToggle(
        projectOrigin.id,
        featureFlag,
        extractAuditInfoFromUser(user),
    );

    await projectService.changeProject(
        projectDest.id,
        featureFlag.name,
        user,
        projectOrigin.id,
        extractAuditInfoFromUser(user),
    );
});

test('Should not be allowed to edit a root role', async () => {
    expect.assertions(1);

    const editRole = await accessService.getRoleByName(RoleName.EDITOR);
    const roleUpdate: IRoleUpdate = {
        createdByUserId: TEST_USER_ID,
        id: editRole.id,
        name: 'NoLongerTheEditor',
        description: '',
    };

    try {
        await accessService.updateRole(roleUpdate, TEST_AUDIT_USER);
    } catch (e) {
        expect(e.toString()).toBe(
            'InvalidOperationError: You cannot change built in roles.',
        );
    }
});

test('Should not be allowed to delete a root role', async () => {
    expect.assertions(1);

    const editRole = await accessService.getRoleByName(RoleName.EDITOR);

    try {
        await accessService.deleteRole(editRole.id, TEST_AUDIT_USER);
    } catch (e) {
        expect(e.toString()).toBe(
            'InvalidOperationError: You cannot change built in roles.',
        );
    }
});

test('Should not be allowed to edit a project role', async () => {
    expect.assertions(1);

    const ownerRole = await accessService.getRoleByName(RoleName.OWNER);
    const roleUpdate: IRoleUpdate = {
        createdByUserId: TEST_USER_ID,
        id: ownerRole.id,
        name: 'NoLongerTheEditor',
        description: '',
    };

    try {
        await accessService.updateRole(roleUpdate, TEST_AUDIT_USER);
    } catch (e) {
        expect(e.toString()).toBe(
            'InvalidOperationError: You cannot change built in roles.',
        );
    }
});

test('Should not be allowed to delete a project role', async () => {
    expect.assertions(1);

    const ownerRole = await accessService.getRoleByName(RoleName.OWNER);

    try {
        await accessService.deleteRole(ownerRole.id, TEST_AUDIT_USER);
    } catch (e) {
        expect(e.toString()).toBe(
            'InvalidOperationError: You cannot change built in roles.',
        );
    }
});

test('Should be allowed move feature flag to project when given access through group', async () => {
    const project = {
        id: 'yet-another-project1',
        name: 'yet-another-project1',
    };

    const viewerUser = await createUser(readRole.id);

    await projectService.createProject(project, editorUser, TEST_AUDIT_USER);

    const groupWithProjectAccess = await createGroup({
        users: [{ user: viewerUser }],
    });

    const projectRole = await accessService.getRoleByName(RoleName.MEMBER);

    await hasCommonProjectAccess(viewerUser, project.id, false);

    await accessService.addGroupToRole(
        groupWithProjectAccess.id!,
        projectRole.id,
        'SomeAdminUser',
        project.id,
    );

    await hasCommonProjectAccess(viewerUser, project.id, true);
});

test('Should not lose user role access when given permissions from a group', async () => {
    const project = {
        id: 'yet-another-project-lose',
        name: 'yet-another-project-lose',
    };
    const user = editorUser;

    await projectService.createProject(project, user, TEST_AUDIT_USER);

    const groupWithNoAccess = await createGroup({
        users: [{ user }],
    });

    const viewerRole = await accessService.getRoleByName(RoleName.VIEWER);

    await accessService.addGroupToRole(
        groupWithNoAccess.id!,
        viewerRole.id,
        'SomeAdminUser',
        project.id,
    );

    await hasFullProjectAccess(user, project.id, true);
});

test('Should allow user to take multiple group roles and have expected permissions on each project', async () => {
    const projectForCreate = {
        id: 'project-that-should-have-create-flag-permission',
        name: 'project-that-should-have-create-flag-permission',
        description: 'Blah',
    };
    const projectForDelete = {
        id: 'project-that-should-have-delete-flag-permission',
        name: 'project-that-should-have-delete-flag-permission',
        description: 'Blah',
    };

    const viewerUser = await createUser(readRole.id);

    await projectService.createProject(
        projectForCreate,
        editorUser,
        TEST_AUDIT_USER,
    );
    await projectService.createProject(
        projectForDelete,
        editorUser,
        TEST_AUDIT_USER,
    );

    const groupWithCreateAccess = await createGroup({
        users: [{ user: viewerUser }],
    });

    const groupWithDeleteAccess = await createGroup({
        users: [{ user: viewerUser }],
    });

    const createFeatureRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
    ]);

    const deleteFeatureRole = await createRole([
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);

    await accessService.addGroupToRole(
        groupWithCreateAccess.id!,
        deleteFeatureRole.id,
        'SomeAdminUser',
        projectForDelete.id,
    );

    await accessService.addGroupToRole(
        groupWithDeleteAccess.id!,
        createFeatureRole.id,
        'SomeAdminUser',
        projectForCreate.id,
    );

    expect(
        await accessService.hasPermission(
            viewerUser,
            permissions.CREATE_FEATURE,
            projectForCreate.id,
        ),
    ).toBe(true);
    expect(
        await accessService.hasPermission(
            viewerUser,
            permissions.DELETE_FEATURE,
            projectForCreate.id,
        ),
    ).toBe(false);

    expect(
        await accessService.hasPermission(
            viewerUser,
            permissions.CREATE_FEATURE,
            projectForDelete.id,
        ),
    ).toBe(false);
    expect(
        await accessService.hasPermission(
            viewerUser,
            permissions.DELETE_FEATURE,
            projectForDelete.id,
        ),
    ).toBe(true);
});

test('Should allow user to take on root role through a group that has a root role defined', async () => {
    const viewerUser = await createUser(readRole.id);

    await createGroup({
        role: adminRole.id,
        users: [{ user: viewerUser }],
    });

    expect(
        await accessService.hasPermission(viewerUser, permissions.ADMIN),
    ).toBe(true);
});

test('Should not elevate permissions for a user that is not present in a root role group', async () => {
    const viewerUser = await createUser(readRole.id);

    const viewerUserNotInGroup = await createUser(readRole.id);

    await createGroup({
        role: adminRole.id,
        users: [{ user: viewerUser }],
    });

    expect(
        await accessService.hasPermission(viewerUser, permissions.ADMIN),
    ).toBe(true);

    expect(
        await accessService.hasPermission(
            viewerUserNotInGroup,
            permissions.ADMIN,
        ),
    ).toBe(false);
});

test('Should not reduce permissions for an admin user that enters an editor group', async () => {
    const adminUser = await createUser(adminRole.id);

    await createGroup({
        role: editorRole.id,
        users: [{ user: adminUser }],
    });

    expect(
        await accessService.hasPermission(adminUser, permissions.ADMIN),
    ).toBe(true);
});

test('Should not change permissions for a user in a group without a root role', async () => {
    const groupStore = stores.groupStore;

    const viewerUser = await createUser(readRole.id);

    const groupWithoutRootRole = await groupStore.create({
        name: 'GroupWithNoRootRole',
        description: '',
    });

    const preAddedToGroupPermissions =
        await accessService.getPermissionsForUser(viewerUser);

    await groupStore.addUsersToGroup(
        groupWithoutRootRole.id!,
        [{ user: viewerUser }],
        'Admin',
    );

    const postAddedToGroupPermissions =
        await accessService.getPermissionsForUser(viewerUser);

    expect(
        JSON.stringify(preAddedToGroupPermissions) ===
            JSON.stringify(postAddedToGroupPermissions),
    ).toBe(true);
});

test('Should add permissions to user when a group is given a root role after the user has been added to the group', async () => {
    const groupStore = stores.groupStore;

    const viewerUser = await createUser(readRole.id);

    const groupWithoutRootRole = await createGroup({
        users: [{ user: viewerUser }],
    });

    expect(
        await accessService.hasPermission(viewerUser, permissions.ADMIN),
    ).toBe(false);

    await groupStore.update({
        id: groupWithoutRootRole.id!,
        name: 'GroupWithNoRootRole',
        rootRole: adminRole.id,
        users: [{ user: viewerUser }],
    });

    expect(
        await accessService.hasPermission(viewerUser, permissions.ADMIN),
    ).toBe(true);
});

test('Should give full project access to the default project to user in a group with an editor root role', async () => {
    const projectName = 'default';

    const viewerUser = await createUser(readRole.id);

    await createGroup({
        role: editorRole.id,
        users: [{ user: viewerUser }],
    });

    await hasFullProjectAccess(viewerUser, projectName, true);
});

test('if user has two roles user has union of permissions from the two roles', async () => {
    const projectName = 'default';

    const emptyUser = await createUser();

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);
    const secondRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.setProjectRolesForUser(projectName, emptyUser.id, [
        firstRole.id,
        secondRole.id,
    ]);

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);
    const permissionNameSet = new Set(
        assignedPermissions.map((p) => p.permission),
    );

    expect(permissionNameSet.size).toBe(3);
});

test('calling set for user overwrites existing roles', async () => {
    const projectName = 'default';

    const emptyUser = await createUser();

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);
    const secondRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.setProjectRolesForUser(projectName, emptyUser.id, [
        firstRole.id,
        secondRole.id,
    ]);

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);
    const permissionNameSet = new Set(
        assignedPermissions.map((p) => p.permission),
    );

    expect(permissionNameSet.size).toBe(3);

    await accessService.setProjectRolesForUser(projectName, emptyUser.id, [
        firstRole.id,
    ]);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(2);
    expect(newAssignedPermissions).toContainEqual({
        project: projectName,
        permission: 'CREATE_FEATURE',
    });
    expect(newAssignedPermissions).toContainEqual({
        project: projectName,
        permission: 'DELETE_FEATURE',
    });
});

test('if group has two roles user has union of permissions from the two roles', async () => {
    const projectName = 'default';

    const emptyUser = await createUser();

    const emptyGroup = await createGroup({
        users: [{ user: emptyUser }],
    });

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);
    const secondRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.setProjectRolesForGroup(
        projectName,
        emptyGroup.id,
        [firstRole.id, secondRole.id],
        'testusr',
    );

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);
    const permissionNameSet = new Set(
        assignedPermissions.map((p) => p.permission),
    );

    expect(permissionNameSet.size).toBe(3);
});

test('calling set for group overwrites existing roles', async () => {
    const projectName = 'default';

    const emptyUser = await createUser();

    const emptyGroup = await createGroup({
        users: [{ user: emptyUser }],
    });

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);
    const secondRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.setProjectRolesForGroup(
        projectName,
        emptyGroup.id,
        [firstRole.id, secondRole.id],
        'testusr',
    );

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);
    const permissionNameSet = new Set(
        assignedPermissions.map((p) => p.permission),
    );

    expect(permissionNameSet.size).toBe(3);

    await accessService.setProjectRolesForGroup(
        projectName,
        emptyGroup.id,
        [firstRole.id],
        'testusr',
    );

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(2);
    expect(newAssignedPermissions).toContainEqual({
        project: projectName,
        permission: 'CREATE_FEATURE',
    });
    expect(newAssignedPermissions).toContainEqual({
        project: projectName,
        permission: 'DELETE_FEATURE',
    });
});

test('group with root role can be assigned a project specific role', async () => {
    const projectName = 'default';

    const emptyUser = await createUser();

    const emptyGroup = await createGroup({
        role: readRole.id,
        users: [{ user: emptyUser }],
    });

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
    ]);

    await accessService.setProjectRolesForGroup(
        projectName,
        emptyGroup.id,
        [firstRole.id],
        'testusr',
    );

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(assignedPermissions).toContainEqual({
        project: projectName,
        permission: 'CREATE_FEATURE',
    });
});

test('calling add access with invalid project role ids should not assign those roles', async () => {
    const projectName = 'default';
    const emptyUser = await createUser();

    const adminRootRole = await accessService.getRoleByName(RoleName.ADMIN);

    await expect(() =>
        accessService.addAccessToProject(
            [adminRootRole.id, 9999],
            [],
            [emptyUser.id],
            projectName,
            'some-admin-user',
        ),
    ).rejects.toThrow(BadDataError);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(0);
});

test('calling set roles for user with invalid project role ids should not assign those roles', async () => {
    const projectName = 'default';
    const emptyUser = await createUser();

    const adminRootRole = await accessService.getRoleByName(RoleName.ADMIN);

    accessService.setProjectRolesForUser(projectName, emptyUser.id, [
        adminRootRole.id,
        9999,
    ]);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(0);
});

test('calling set roles for user with empty role array removes all roles', async () => {
    const projectName = 'default';
    const emptyUser = await createUser();

    const role = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
    ]);

    await accessService.setProjectRolesForUser(projectName, emptyUser.id, [
        role.id,
    ]);

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(assignedPermissions.length).toBe(1);

    await accessService.setProjectRolesForUser(projectName, emptyUser.id, []);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(0);
});

test('calling set roles for user with empty role array should not remove root roles', async () => {
    const projectName = 'default';
    const adminUser = await createUser(adminRole.id);

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);

    await accessService.setProjectRolesForUser(projectName, adminUser.id, [
        firstRole.id,
    ]);

    const assignedPermissions =
        await accessService.getPermissionsForUser(adminUser);

    expect(assignedPermissions.length).toBe(3);

    await accessService.setProjectRolesForUser(projectName, adminUser.id, []);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(adminUser);

    expect(newAssignedPermissions.length).toBe(1);
    expect(newAssignedPermissions[0].permission).toBe(permissions.ADMIN);
});

test('remove user access should remove all project roles', async () => {
    const projectName = 'default';
    const emptyUser = await createUser();

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);

    const secondRole = await createRole([
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.setProjectRolesForUser(projectName, emptyUser.id, [
        firstRole.id,
        secondRole.id,
    ]);

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(assignedPermissions.length).toBe(3);

    await accessService.removeUserAccess(projectName, emptyUser.id);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(0);
});

test('remove user access should remove all project roles, while leaving root roles untouched', async () => {
    const projectName = 'default';
    const adminUser = await createUser(adminRole.id);

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);

    const secondRole = await createRole([
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.setProjectRolesForUser(projectName, adminUser.id, [
        firstRole.id,
        secondRole.id,
    ]);

    const assignedPermissions =
        await accessService.getPermissionsForUser(adminUser);

    expect(assignedPermissions.length).toBe(4);

    await accessService.removeUserAccess(projectName, adminUser.id);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(adminUser);

    expect(newAssignedPermissions.length).toBe(1);
    expect(newAssignedPermissions[0].permission).toBe(permissions.ADMIN);
});

test('calling set roles for group with invalid project role ids should not assign those roles', async () => {
    const projectName = 'default';

    const emptyUser = await createUser();
    const emptyGroup = await createGroup({
        users: [{ user: emptyUser }],
    });

    const adminRootRole = await accessService.getRoleByName(RoleName.ADMIN);

    accessService.setProjectRolesForGroup(
        projectName,
        emptyGroup.id,
        [adminRootRole.id, 9999],
        'admin',
    );

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(0);
});

test('calling set roles for group with empty role array removes all roles', async () => {
    const projectName = 'default';

    const emptyUser = await createUser();
    const emptyGroup = await createGroup({
        users: [{ user: emptyUser }],
    });

    const role = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
    ]);

    await accessService.setProjectRolesForGroup(
        projectName,
        emptyGroup.id,
        [role.id],
        'admin',
    );

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(assignedPermissions.length).toBe(1);

    await accessService.setProjectRolesForGroup(
        projectName,
        emptyGroup.id,
        [],
        'admin',
    );

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(0);
});

test('calling set roles for group with empty role array should not remove root roles', async () => {
    const projectName = 'default';

    const adminUser = await createUser(adminRole.id);
    const group = await createGroup({
        users: [{ user: adminUser }],
    });

    const role = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);

    await accessService.setProjectRolesForGroup(
        projectName,
        group.id,
        [role.id],
        'admin',
    );

    const assignedPermissions =
        await accessService.getPermissionsForUser(adminUser);

    expect(assignedPermissions.length).toBe(3);

    await accessService.setProjectRolesForGroup(
        projectName,
        group.id,
        [],
        'admin',
    );

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(adminUser);

    expect(newAssignedPermissions.length).toBe(1);
    expect(newAssignedPermissions[0].permission).toBe(permissions.ADMIN);
});

test('remove group access should remove all project roles', async () => {
    const projectName = 'default';
    const emptyUser = await createUser();
    const group = await createGroup({
        users: [{ user: emptyUser }],
    });

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);

    const secondRole = await createRole([
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.setProjectRolesForGroup(
        projectName,
        group.id,
        [firstRole.id, secondRole.id],
        'admin',
    );

    const assignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(assignedPermissions.length).toBe(3);

    await accessService.removeGroupAccess(projectName, group.id);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(emptyUser);

    expect(newAssignedPermissions.length).toBe(0);
});

test('remove group access should remove all project roles, while leaving root roles untouched', async () => {
    const projectName = 'default';
    const adminUser = await createUser(adminRole.id);
    const group = await createGroup({
        users: [{ user: adminUser }],
    });

    const firstRole = await createRole([
        {
            id: 2,
            name: 'CREATE_FEATURE',
        },
        {
            id: 8,
            name: 'DELETE_FEATURE',
        },
    ]);

    const secondRole = await createRole([
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.setProjectRolesForGroup(
        projectName,
        group.id,
        [firstRole.id, secondRole.id],
        'admin',
    );

    const assignedPermissions =
        await accessService.getPermissionsForUser(adminUser);

    expect(assignedPermissions.length).toBe(4);

    await accessService.removeGroupAccess(projectName, group.id);

    const newAssignedPermissions =
        await accessService.getPermissionsForUser(adminUser);

    expect(newAssignedPermissions.length).toBe(1);
    expect(newAssignedPermissions[0].permission).toBe(permissions.ADMIN);
});

test('access overview should have admin access and default project for admin user', async () => {
    const email = 'a-person@places.com';

    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some User',
        email,
    });

    await accessService.setUserRootRole(user.id, adminRole.id);

    const accessOverView: IUserAccessOverview[] =
        await accessService.getUserAccessOverview();
    const userAccess = accessOverView.find(
        (overviewRow) => overviewRow.userId === user.id,
    )!;

    expect(userAccess.userId).toBe(user.id);

    expect(userAccess.rootRole).toBe('Admin');
    expect(userAccess.accessibleProjects).toStrictEqual(['default']);
});

test('access overview should have group access for groups that they are in', async () => {
    const email = 'a-nother-person@places.com';

    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Some Other User',
        email,
    });

    await accessService.setUserRootRole(user.id, adminRole.id);

    const group = await stores.groupStore.create({
        name: 'Test Group',
    });

    await stores.groupStore.addUsersToGroup(
        group.id,
        [
            {
                user: {
                    id: user.id,
                },
            },
        ],
        'Admin',
    );

    const someGroupRole = await createRole([
        {
            id: 13,
            name: 'UPDATE_PROJECT',
        },
    ]);

    await accessService.addGroupToRole(
        group.id,
        someGroupRole.id,
        'creator',
        'default',
    );

    const accessOverView: IUserAccessOverview[] =
        await accessService.getUserAccessOverview();
    const userAccess = accessOverView.find(
        (overviewRow) => overviewRow.userId === user.id,
    )!;

    expect(userAccess.userId).toBe(user.id);

    expect(userAccess.rootRole).toBe('Admin');
    expect(userAccess.groups).toStrictEqual(['Test Group']);

    expect(userAccess.groupProjects).toStrictEqual(['default']);
});

test('access overview should include users with custom root roles', async () => {
    const email = 'ratatoskr@yggdrasil.com';

    const customRole = await accessService.createRole(
        {
            name: 'Mischievous Messenger',
            type: CUSTOM_ROOT_ROLE_TYPE,
            description:
                'A squirrel that runs up and down the world tree, carrying messages.',
            permissions: [{ name: permissions.CREATE_ADDON }],
            createdByUserId: 1,
        },
        SYSTEM_USER_AUDIT,
    );

    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Ratatoskr',
        email,
    });

    await accessService.setUserRootRole(user.id, customRole.id);

    const accessOverView: IUserAccessOverview[] =
        await accessService.getUserAccessOverview();
    const userAccess = accessOverView.find(
        (overviewRow) => overviewRow.userId === user.id,
    )!;

    expect(userAccess.userId).toBe(user.id);
    expect(userAccess.rootRole).toBe('Mischievous Messenger');
});

test("creating a role with permissions that don't exist should throw a bad data error", async () => {
    await expect(() =>
        accessService.createRole(
            {
                name: 'Oogus Boogus',
                type: CUSTOM_ROOT_ROLE_TYPE,
                description:
                    "Well, well, well ... what have we here? Sandy Claws, huh? Oooh, I'm really scared!",
                permissions: [{ name: 'BOGUS' }],
                createdByUserId: 1,
            },
            SYSTEM_USER_AUDIT,
        ),
    ).rejects.toThrow(
        expect.objectContaining({
            name: 'BadDataError',
            message: expect.stringMatching(/BOGUS/),
        }),
    );
});

test("Updating a role with permissions that don't exist should throw a bad data error", async () => {
    const custom_role = await accessService.createRole(
        {
            name: 'Legit custom role',
            type: CUSTOM_ROOT_ROLE_TYPE,
            description: '',
            permissions: [{ name: permissions.CREATE_ADDON }],
            createdByUserId: 1,
        },
        SYSTEM_USER_AUDIT,
    );
    await expect(() =>
        accessService.updateRole(
            {
                id: custom_role.id,
                name: 'Oogus Boogus',
                type: CUSTOM_ROOT_ROLE_TYPE,
                description:
                    'This might be the last time that you hear the Boogus song',
                permissions: [{ name: 'BOGUS' }],
                createdByUserId: 1,
            },
            SYSTEM_USER_AUDIT,
        ),
    ).rejects.toThrow(
        expect.objectContaining({
            name: 'BadDataError',
            message: expect.stringMatching(/BOGUS/),
        }),
    );
});
