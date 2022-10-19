import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

// eslint-disable-next-line import/no-unresolved
import { AccessService } from '../../../lib/services/access-service';

import * as permissions from '../../../lib/types/permissions';
import { RoleName } from '../../../lib/types/model';
import { IUnleashStores } from '../../../lib/types';
import FeatureToggleService from '../../../lib/services/feature-toggle-service';
import ProjectService from '../../../lib/services/project-service';
import { createTestConfig } from '../../config/test-config';
import { DEFAULT_PROJECT } from '../../../lib/types/project';
import { ALL_PROJECTS } from '../../../lib/util/constants';
import { SegmentService } from '../../../lib/services/segment-service';
import { GroupService } from '../../../lib/services/group-service';

let db: ITestDb;
let stores: IUnleashStores;
let accessService;
let groupService;
let featureToggleService;
let projectService;
let editorUser;
let superUser;
let editorRole;
let adminRole;
let readRole;

const createUserEditorAccess = async (name, email) => {
    const { userStore } = stores;
    const user = await userStore.insert({ name, email });
    await accessService.addUserToRole(user.id, editorRole.id, 'default');
    return user;
};

const createUserViewerAccess = async (name, email) => {
    const { userStore } = stores;
    const user = await userStore.insert({ name, email });
    await accessService.addUserToRole(user.id, readRole.id, ALL_PROJECTS);
    return user;
};

const hasCommonProjectAccess = async (user, projectName, condition) => {
    const defaultEnv = 'default';
    const developmentEnv = 'development';
    const productionEnv = 'production';

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
    expect(
        await accessService.hasPermission(
            user,
            CREATE_FEATURE_STRATEGY,
            projectName,
            developmentEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            UPDATE_FEATURE_STRATEGY,
            projectName,
            developmentEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            DELETE_FEATURE_STRATEGY,
            projectName,
            developmentEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            UPDATE_FEATURE_ENVIRONMENT,
            projectName,
            developmentEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            CREATE_FEATURE_STRATEGY,
            projectName,
            productionEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            UPDATE_FEATURE_STRATEGY,
            projectName,
            productionEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            DELETE_FEATURE_STRATEGY,
            projectName,
            productionEnv,
        ),
    ).toBe(condition);
    expect(
        await accessService.hasPermission(
            user,
            UPDATE_FEATURE_ENVIRONMENT,
            projectName,
            productionEnv,
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

const createSuperUser = async () => {
    const { userStore } = stores;
    const user = await userStore.insert({
        name: 'Alice Admin',
        email: 'admin@getunleash.io',
    });
    await accessService.addUserToRole(user.id, adminRole.id, ALL_PROJECTS);
    return user;
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
    groupService = new GroupService(stores, { getLogger });
    accessService = new AccessService(stores, { getLogger }, groupService);
    const roles = await accessService.getRootRoles();
    editorRole = roles.find((r) => r.name === RoleName.EDITOR);
    adminRole = roles.find((r) => r.name === RoleName.ADMIN);
    readRole = roles.find((r) => r.name === RoleName.VIEWER);
    featureToggleService = new FeatureToggleService(
        stores,
        config,
        new SegmentService(stores, config),
        accessService,
    );
    projectService = new ProjectService(
        stores,
        config,
        accessService,
        featureToggleService,
        groupService,
    );

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
        '*',
    );

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
    const project = 'some-project';
    const user = editorUser;
    await accessService.createDefaultProjectRoles(user, project);
    await hasFullProjectAccess(user, project, true);
});

test('should require name when create default roles to project', async () => {
    await expect(async () => {
        await accessService.createDefaultProjectRoles(editorUser);
    }).rejects.toThrow(new Error('ProjectId cannot be empty'));
});

test('should grant user access to project', async () => {
    const { DELETE_PROJECT, UPDATE_PROJECT } = permissions;
    const project = 'another-project';
    const user = editorUser;
    const sUser = await createUserViewerAccess(
        'Some Random',
        'random@getunleash.io',
    );
    await accessService.createDefaultProjectRoles(user, project);

    const projectRole = await accessService.getRoleByName(RoleName.MEMBER);
    await accessService.addUserToRole(sUser.id, projectRole.id, project);

    // // Should be able to update feature toggles inside the project
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
    const sUser = await createUserViewerAccess(
        'Some Random',
        'random22@getunleash.io',
    );
    await accessService.createDefaultProjectRoles(user, project);

    const projectRole = await accessService.getRoleByName(RoleName.MEMBER);

    await accessService.addUserToRole(sUser.id, projectRole.id, project);

    // Should not be able to update feature toggles outside project
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
        [CREATE_FEATURE_STRATEGY],
        'production',
    );
    await accessStore.addUserToRole(user.id, customRole.id, ALL_PROJECTS);

    const hasAccess = await accessService.hasPermission(
        user,
        CREATE_FEATURE_STRATEGY,
        'default',
        'production',
    );

    expect(hasAccess).toBe(true);

    const hasNotAccess = await accessService.hasPermission(
        user,
        CREATE_FEATURE_STRATEGY,
        'default',
        'development',
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
            'development',
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
            'development',
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
            'development',
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
    await projectService.createProject(project, user.id);

    const projectMember = await stores.userStore.insert({
        name: 'CustomProjectMember',
        email: 'custom@getunleash.io',
    });

    const customRole = await accessService.createRole({
        name: 'RoleInUse',
        description: '',
        permissions: [
            {
                id: 2,
                name: 'CREATE_FEATURE',
                environment: null,
                displayName: 'Create Feature Toggles',
                type: 'project',
            },
            {
                id: 8,
                name: 'DELETE_FEATURE',
                environment: null,
                displayName: 'Delete Feature Toggles',
                type: 'project',
            },
        ],
    });

    await projectService.addUser(project.id, customRole.id, projectMember.id);

    try {
        await accessService.deleteRole(customRole.id);
    } catch (e) {
        expect(e.toString()).toBe(
            'RoleInUseError: Role is in use by more than one user. You cannot delete a role that is in use without first removing the role from the users.',
        );
    }
});

test('Should be denied move feature toggle to project where the user does not have access', async () => {
    const user = editorUser;
    const editorUser2 = await createUserEditorAccess(
        'seconduser',
        'bob2@gmail.com',
    );

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
    await projectService.createProject(projectOrigin, user.id);
    await projectService.createProject(projectDest, editorUser2.id);

    const featureToggle = { name: 'moveableToggle' };

    await featureToggleService.createFeatureToggle(
        projectOrigin.id,
        featureToggle,
        user.username,
    );

    try {
        await projectService.changeProject(
            projectDest.id,
            featureToggle.name,
            user,
            projectOrigin.id,
        );
    } catch (e) {
        expect(e.toString()).toBe(
            'NoAccessError: You need permission=MOVE_FEATURE_TOGGLE to perform this action',
        );
    }
});

test('Should be allowed move feature toggle to project when the user has access', async () => {
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
    await projectService.createProject(projectOrigin, user);
    await projectService.createProject(projectDest, user);

    const featureToggle = { name: 'moveableToggle2' };

    await featureToggleService.createFeatureToggle(
        projectOrigin.id,
        featureToggle,
        user.username,
    );

    await projectService.changeProject(
        projectDest.id,
        featureToggle.name,
        user,
        projectOrigin.id,
    );
});

test('Should not be allowed to edit a root role', async () => {
    expect.assertions(1);

    const editRole = await accessService.getRoleByName(RoleName.EDITOR);
    const roleUpdate = {
        id: editRole.id,
        name: 'NoLongerTheEditor',
        description: '',
    };

    try {
        await accessService.updateRole(roleUpdate);
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
        await accessService.deleteRole(editRole.id);
    } catch (e) {
        expect(e.toString()).toBe(
            'InvalidOperationError: You cannot change built in roles.',
        );
    }
});

test('Should not be allowed to edit a project role', async () => {
    expect.assertions(1);

    const ownerRole = await accessService.getRoleByName(RoleName.OWNER);
    const roleUpdate = {
        id: ownerRole.id,
        name: 'NoLongerTheEditor',
        description: '',
    };

    try {
        await accessService.updateRole(roleUpdate);
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
        await accessService.deleteRole(ownerRole.id);
    } catch (e) {
        expect(e.toString()).toBe(
            'InvalidOperationError: You cannot change built in roles.',
        );
    }
});

test('Should be allowed move feature toggle to project when given access through group', async () => {
    const project = {
        id: 'yet-another-project1',
        name: 'yet-another-project1',
    };

    const groupStore = stores.groupStore;
    const viewerUser = await createUserViewerAccess(
        'Victoria Viewer',
        'vickyv@getunleash.io',
    );

    await projectService.createProject(project, editorUser);

    const groupWithProjectAccess = await groupStore.create({
        name: 'Project Editors',
        description: '',
    });

    await groupStore.addUsersToGroup(
        groupWithProjectAccess.id,
        [{ user: viewerUser }],
        'Admin',
    );

    const projectRole = await accessService.getRoleByName(RoleName.MEMBER);

    await hasCommonProjectAccess(viewerUser, project.id, false);

    await accessService.addGroupToRole(
        groupWithProjectAccess.id,
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
    const groupStore = stores.groupStore;

    await projectService.createProject(project, user);

    // await accessService.createDefaultProjectRoles(user, project.id);

    const groupWithNoAccess = await groupStore.create({
        name: 'ViewersOnly',
        description: '',
    });

    await groupStore.addUsersToGroup(
        groupWithNoAccess.id,
        [{ user: user }],
        'Admin',
    );

    const viewerRole = await accessService.getRoleByName(RoleName.VIEWER);

    await accessService.addGroupToRole(
        groupWithNoAccess.id,
        viewerRole.id,
        'SomeAdminUser',
        project.id,
    );

    await hasFullProjectAccess(user, project.id, true);
});

test('Should allow user to take multiple group roles and have expected permissions on each project', async () => {
    const projectForCreate = {
        id: 'project-that-should-have-create-toggle-permission',
        name: 'project-that-should-have-create-toggle-permission',
        description: 'Blah',
    };
    const projectForDelete = {
        id: 'project-that-should-have-delete-toggle-permission',
        name: 'project-that-should-have-delete-toggle-permission',
        description: 'Blah',
    };

    const groupStore = stores.groupStore;
    const viewerUser = await createUserViewerAccess(
        'Victor Viewer',
        'victore@getunleash.io',
    );

    await projectService.createProject(projectForCreate, editorUser);
    await projectService.createProject(projectForDelete, editorUser);

    const groupWithCreateAccess = await groupStore.create({
        name: 'ViewersOnly',
        description: '',
    });

    const groupWithDeleteAccess = await groupStore.create({
        name: 'ViewersOnly',
        description: '',
    });

    await groupStore.addUsersToGroup(
        groupWithCreateAccess.id,
        [{ user: viewerUser }],
        'Admin',
    );

    await groupStore.addUsersToGroup(
        groupWithDeleteAccess.id,
        [{ user: viewerUser }],
        'Admin',
    );

    const createFeatureRole = await accessService.createRole({
        name: 'CreateRole',
        description: '',
        permissions: [
            {
                id: 2,
                name: 'CREATE_FEATURE',
                environment: null,
                displayName: 'Create Feature Toggles',
                type: 'project',
            },
        ],
    });

    const deleteFeatureRole = await accessService.createRole({
        name: 'DeleteRole',
        description: '',
        permissions: [
            {
                id: 8,
                name: 'DELETE_FEATURE',
                environment: null,
                displayName: 'Delete Feature Toggles',
                type: 'project',
            },
        ],
    });

    await accessService.addGroupToRole(
        groupWithCreateAccess.id,
        deleteFeatureRole.id,
        'SomeAdminUser',
        projectForDelete.id,
    );

    await accessService.addGroupToRole(
        groupWithDeleteAccess.id,
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
