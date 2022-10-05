import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import FeatureToggleService from '../../../lib/services/feature-toggle-service';
import ProjectService from '../../../lib/services/project-service';
import { AccessService } from '../../../lib/services/access-service';
import { MOVE_FEATURE_TOGGLE } from '../../../lib/types/permissions';
import { createTestConfig } from '../../config/test-config';
import { RoleName } from '../../../lib/types/model';
import { randomId } from '../../../lib/util/random-id';
import EnvironmentService from '../../../lib/services/environment-service';
import IncompatibleProjectError from '../../../lib/error/incompatible-project-error';
import { SegmentService } from '../../../lib/services/segment-service';
import { GroupService } from '../../../lib/services/group-service';

let stores;
let db: ITestDb;

let projectService: ProjectService;
let groupService: GroupService;
let accessService: AccessService;
let environmentService: EnvironmentService;
let featureToggleService: FeatureToggleService;
let user;

beforeAll(async () => {
    db = await dbInit('project_service_serial', getLogger);
    stores = db.stores;
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    const config = createTestConfig({
        getLogger,
        // @ts-ignore
        experimental: { environments: { enabled: true } },
    });
    groupService = new GroupService(stores, config);
    accessService = new AccessService(stores, config, groupService);
    featureToggleService = new FeatureToggleService(
        stores,
        config,
        new SegmentService(stores, config),
        accessService,
    );
    environmentService = new EnvironmentService(stores, config);
    projectService = new ProjectService(
        stores,
        config,
        accessService,
        featureToggleService,
        groupService,
    );
});

afterAll(async () => {
    await db.destroy();
});

afterEach(async () => {
    const envs = await stores.environmentStore.getAll();
    const deleteEnvs = envs
        .filter((env) => env.name !== 'default')
        .map(async (env) => {
            await stores.environmentStore.delete(env.name);
        });
    const users = await stores.userStore.getAll();
    const wipeUserPermissions = users.map(async (u) => {
        await stores.accessStore.unlinkUserRoles(u.id);
    });
    await Promise.allSettled(deleteEnvs);
    await Promise.allSettled(wipeUserPermissions);
});

test('should have default project', async () => {
    const project = await projectService.getProject('default');
    expect(project).toBeDefined();
    expect(project.id).toBe('default');
});

test('should list all projects', async () => {
    const project = {
        id: 'test-list',
        name: 'New project',
        description: 'Blah',
    };

    await projectService.createProject(project, user);
    const projects = await projectService.getProjects();
    expect(projects).toHaveLength(2);
    expect(projects.find((p) => p.name === project.name)?.memberCount).toBe(1);
});

test('should create new project', async () => {
    const project = {
        id: 'test',
        name: 'New project',
        description: 'Blah',
    };

    await projectService.createProject(project, user);
    const ret = await projectService.getProject('test');
    expect(project.id).toEqual(ret.id);
    expect(project.name).toEqual(ret.name);
    expect(project.description).toEqual(ret.description);
    expect(ret.createdAt).toBeTruthy();
});

test('should delete project', async () => {
    const project = {
        id: 'test-delete',
        name: 'New project',
        description: 'Blah',
    };

    await projectService.createProject(project, user);
    await projectService.deleteProject(project.id, user);

    try {
        await projectService.getProject(project.id);
    } catch (err) {
        expect(err.message).toBe('No project found');
    }
});

test('should not be able to delete project with toggles', async () => {
    const project = {
        id: 'test-delete-with-toggles',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);
    await stores.featureToggleStore.create(project.id, {
        name: 'test-project-delete',
        project: project.id,
        enabled: false,
    });

    try {
        await projectService.deleteProject(project.id, user);
    } catch (err) {
        expect(err.message).toBe(
            'You can not delete a project with active feature toggles',
        );
    }
});

test('should not delete "default" project', async () => {
    try {
        await projectService.deleteProject('default', user);
    } catch (err) {
        expect(err.message).toBe('You can not delete the default project!');
    }
});

test('should validate name, legal', async () => {
    const result = await projectService.validateId('new_name');
    expect(result).toBe(true);
});

test('should not be able to create existing project', async () => {
    const project = {
        id: 'test-delete',
        name: 'New project',
        description: 'Blah',
    };
    try {
        await projectService.createProject(project, user);
        await projectService.createProject(project, user);
    } catch (err) {
        expect(err.message).toBe('A project with this id already exists.');
    }
});

test('should require URL friendly ID', async () => {
    try {
        await projectService.validateId('new name øæå');
    } catch (err) {
        expect(err.message).toBe('"value" must be URL friendly');
    }
});

test('should require unique ID', async () => {
    try {
        await projectService.validateId('default');
    } catch (err) {
        expect(err.message).toBe('A project with this id already exists.');
    }
});

test('should update project', async () => {
    const project = {
        id: 'test-update',
        name: 'New project',
        description: 'Blah',
    };

    const updatedProject = {
        id: 'test-update',
        name: 'New name',
        description: 'Blah longer desc',
    };

    await projectService.createProject(project, user);
    await projectService.updateProject(updatedProject, user);

    const readProject = await projectService.getProject(project.id);

    expect(updatedProject.name).toBe(readProject.name);
    expect(updatedProject.description).toBe(readProject.description);
});

test('should give error when getting unknown project', async () => {
    try {
        await projectService.getProject('unknown');
    } catch (err) {
        expect(err.message).toBe('No project found');
    }
});

test('should get list of users with access to project', async () => {
    const project = {
        id: 'test-roles-access',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);
    const { users } = await projectService.getAccessToProject(project.id);

    const member = await stores.roleStore.getRoleByName(RoleName.MEMBER);
    const owner = await stores.roleStore.getRoleByName(RoleName.OWNER);

    expect(users).toHaveLength(1);
    expect(users[0].id).toBe(user.id);
    expect(users[0].name).toBe(user.name);
    expect(users[0].roleId).toBe(owner.id);
    expect(member).toBeTruthy();
});

test('should add a member user to the project', async () => {
    const project = {
        id: 'add-users',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'member1@getunleash.io',
    });
    const projectMember2 = await stores.userStore.insert({
        name: 'Some Member 2',
        email: 'member2@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addUser(
        project.id,
        memberRole.id,
        projectMember1.id,
        'test',
    );
    await projectService.addUser(
        project.id,
        memberRole.id,
        projectMember2.id,
        'test',
    );

    const { users } = await projectService.getAccessToProject(project.id);
    const memberUsers = users.filter((u) => u.roleId === memberRole.id);

    expect(memberUsers).toHaveLength(2);
    expect(memberUsers[0].id).toBe(projectMember1.id);
    expect(memberUsers[0].name).toBe(projectMember1.name);
    expect(memberUsers[1].id).toBe(projectMember2.id);
    expect(memberUsers[1].name).toBe(projectMember2.name);
});

test('should add admin users to the project', async () => {
    const project = {
        id: 'add-admin-users',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectAdmin1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'admin1@getunleash.io',
    });
    const projectAdmin2 = await stores.userStore.insert({
        name: 'Some Member 2',
        email: 'admin2@getunleash.io',
    });

    const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);

    await projectService.addUser(
        project.id,
        ownerRole.id,
        projectAdmin1.id,
        'test',
    );
    await projectService.addUser(
        project.id,
        ownerRole.id,
        projectAdmin2.id,
        'test',
    );

    const { users } = await projectService.getAccessToProject(project.id);

    const adminUsers = users.filter((u) => u.roleId === ownerRole.id);

    expect(adminUsers).toHaveLength(3);
    expect(adminUsers[1].id).toBe(projectAdmin1.id);
    expect(adminUsers[1].name).toBe(projectAdmin1.name);
    expect(adminUsers[2].id).toBe(projectAdmin2.id);
    expect(adminUsers[2].name).toBe(projectAdmin2.name);
});

test('add user should fail if user already have access', async () => {
    const project = {
        id: 'add-users-twice',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'member42@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addUser(
        project.id,
        memberRole.id,
        projectMember1.id,
        'test',
    );

    await expect(async () =>
        projectService.addUser(
            project.id,
            memberRole.id,
            projectMember1.id,
            'test',
        ),
    ).rejects.toThrow(
        new Error('User already has access to project=add-users-twice'),
    );
});

test('should remove user from the project', async () => {
    const project = {
        id: 'remove-users',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'member99@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addUser(
        project.id,
        memberRole.id,
        projectMember1.id,
        'test',
    );
    await projectService.removeUser(
        project.id,
        memberRole.id,
        projectMember1.id,
        'test',
    );

    const { users } = await projectService.getAccessToProject(project.id);
    const memberUsers = users.filter((u) => u.roleId === memberRole.id);

    expect(memberUsers).toHaveLength(0);
});

test('should not remove user from the project', async () => {
    const project = {
        id: 'remove-users-not-allowed',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const roles = await stores.roleStore.getRolesForProject(project.id);
    const ownerRole = roles.find((r) => r.name === RoleName.OWNER);

    await expect(async () => {
        await projectService.removeUser(
            project.id,
            ownerRole.id,
            user.id,
            'test',
        );
    }).rejects.toThrowError(
        new Error('A project must have at least one owner'),
    );
});

test('should not change project if feature toggle project does not match current project id', async () => {
    const project = {
        id: 'test-change-project',
        name: 'New project',
        description: 'Blah',
    };

    const toggle = { name: 'test-toggle' };

    await projectService.createProject(project, user);
    await featureToggleService.createFeatureToggle(project.id, toggle, user);

    try {
        await projectService.changeProject(
            'newProject',
            toggle.name,
            user,
            'wrong-project-id',
        );
    } catch (err) {
        expect(err.message).toBe(
            `You need permission=${MOVE_FEATURE_TOGGLE} to perform this action`,
        );
    }
});

test('should return 404 if no project is found with the project id', async () => {
    const project = {
        id: 'test-change-project-2',
        name: 'New project',
        description: 'Blah',
    };

    const toggle = { name: 'test-toggle-2' };

    await projectService.createProject(project, user);
    await featureToggleService.createFeatureToggle(project.id, toggle, user);

    try {
        await projectService.changeProject(
            'newProject',
            toggle.name,
            user,
            project.id,
        );
    } catch (err) {
        expect(err.message).toBe(`No project found`);
    }
});

test('should fail if user is not authorized', async () => {
    const project = {
        id: 'test-change-project-3',
        name: 'New project',
        description: 'Blah',
    };

    const projectDestination = {
        id: 'test-change-project-dest',
        name: 'New project 2',
        description: 'Blah',
    };

    const toggle = { name: 'test-toggle-3' };
    const projectAdmin1 = await stores.userStore.insert({
        name: 'test-change-project-creator',
        email: 'admin-change-project@getunleash.io',
    });

    await projectService.createProject(project, user);
    await projectService.createProject(projectDestination, projectAdmin1);
    await featureToggleService.createFeatureToggle(project.id, toggle, user);

    try {
        await projectService.changeProject(
            projectDestination.id,
            toggle.name,
            user,
            project.id,
        );
    } catch (err) {
        expect(err.message).toBe(
            `You need permission=${MOVE_FEATURE_TOGGLE} to perform this action`,
        );
    }
});

test('should change project when checks pass', async () => {
    const projectA = { id: randomId(), name: randomId() };
    const projectB = { id: randomId(), name: randomId() };
    const toggle = { name: randomId() };

    await projectService.createProject(projectA, user);
    await projectService.createProject(projectB, user);
    await featureToggleService.createFeatureToggle(projectA.id, toggle, user);
    await projectService.changeProject(
        projectB.id,
        toggle.name,
        user,
        projectA.id,
    );

    const updatedFeature = await featureToggleService.getFeature(toggle.name);
    expect(updatedFeature.project).toBe(projectB.id);
});

test('changing project should emit event even if user does not have a username set', async () => {
    const projectA = { id: randomId(), name: randomId() };
    const projectB = { id: randomId(), name: randomId() };
    const toggle = { name: randomId() };
    await projectService.createProject(projectA, user);
    await projectService.createProject(projectB, user);
    await featureToggleService.createFeatureToggle(projectA.id, toggle, user);
    const eventsBeforeChange = await stores.eventStore.getEvents();
    await projectService.changeProject(
        projectB.id,
        toggle.name,
        user,
        projectA.id,
    );
    const eventsAfterChange = await stores.eventStore.getEvents();
    expect(eventsAfterChange.length).toBe(eventsBeforeChange.length + 1);
}, 10000);

test('should require equal project environments to move features', async () => {
    const projectA = { id: randomId(), name: randomId() };
    const projectB = { id: randomId(), name: randomId() };
    const environment = { name: randomId(), type: 'production' };
    const toggle = { name: randomId() };

    await projectService.createProject(projectA, user);
    await projectService.createProject(projectB, user);
    await featureToggleService.createFeatureToggle(projectA.id, toggle, user);
    await stores.environmentStore.create(environment);
    await environmentService.addEnvironmentToProject(
        environment.name,
        projectB.id,
    );

    await expect(() =>
        projectService.changeProject(
            projectB.id,
            toggle.name,
            user,
            projectA.id,
        ),
    ).rejects.toThrowError(IncompatibleProjectError);
});

test('A newly created project only gets connected to enabled environments', async () => {
    const project = {
        id: 'environment-test',
        name: 'New environment project',
        description: 'Blah',
    };
    const enabledEnv = 'connection_test';
    await db.stores.environmentStore.create({
        name: enabledEnv,
        type: 'test',
    });
    const disabledEnv = 'do_not_connect';
    await db.stores.environmentStore.create({
        name: disabledEnv,
        type: 'test',
        enabled: false,
    });

    await projectService.createProject(project, user);
    const connectedEnvs =
        await db.stores.projectStore.getEnvironmentsForProject(project.id);
    expect(connectedEnvs).toHaveLength(2); // default, connection_test
    expect(connectedEnvs.some((e) => e === enabledEnv)).toBeTruthy();
    expect(connectedEnvs.some((e) => e === disabledEnv)).toBeFalsy();
});

test('should have environments sorted in order', async () => {
    const project = {
        id: 'environment-order-test',
        name: 'Environment testing project',
        description: '',
    };
    const first = 'test';
    const second = 'abc';
    const third = 'example';
    const fourth = 'mock';
    await db.stores.environmentStore.create({
        name: first,
        type: 'test',
        sortOrder: 1,
    });
    await db.stores.environmentStore.create({
        name: fourth,
        type: 'test',
        sortOrder: 4,
    });
    await db.stores.environmentStore.create({
        name: third,
        type: 'test',
        sortOrder: 3,
    });
    await db.stores.environmentStore.create({
        name: second,
        type: 'test',
        sortOrder: 2,
    });

    await projectService.createProject(project, user);
    const connectedEnvs =
        await db.stores.projectStore.getEnvironmentsForProject(project.id);

    expect(connectedEnvs).toEqual(['default', first, second, third, fourth]);
});

test('should add a user to the project with a custom role', async () => {
    const project = {
        id: 'add-users-custom-role',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert({
        name: 'Custom',
        email: 'custom@getunleash.io',
    });

    const customRole = await accessService.createRole({
        name: 'Service Engineer2',
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

    await projectService.addUser(
        project.id,
        customRole.id,
        projectMember1.id,
        'test',
    );

    const { users } = await projectService.getAccessToProject(project.id);

    const customRoleMember = users.filter((u) => u.roleId === customRole.id);

    expect(customRoleMember).toHaveLength(1);
    expect(customRoleMember[0].id).toBe(projectMember1.id);
    expect(customRoleMember[0].name).toBe(projectMember1.name);
});

test('should delete role entries when deleting project', async () => {
    const project = {
        id: 'test-delete-users-1',
        name: 'New project',
        description: 'Blah',
    };

    await projectService.createProject(project, user);

    const user1 = await stores.userStore.insert({
        name: 'Projectuser1',
        email: 'project1@getunleash.io',
    });

    const user2 = await stores.userStore.insert({
        name: 'Projectuser2',
        email: 'project2@getunleash.io',
    });

    const customRole = await accessService.createRole({
        name: 'Service Engineer',
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

    await projectService.addUser(project.id, customRole.id, user1.id, 'test');
    await projectService.addUser(project.id, customRole.id, user2.id, 'test');

    let usersForRole = await accessService.getUsersForRole(customRole.id);
    expect(usersForRole.length).toBe(2);

    await projectService.deleteProject(project.id, user);
    usersForRole = await accessService.getUsersForRole(customRole.id);
    expect(usersForRole.length).toBe(0);
});

test('should change a users role in the project', async () => {
    const project = {
        id: 'test-change-user-role',
        name: 'New project',
        description: 'Blah',
    };

    await projectService.createProject(project, user);

    const projectUser = await stores.userStore.insert({
        name: 'Projectuser3',
        email: 'project3@getunleash.io',
    });

    const customRole = await accessService.createRole({
        name: 'Service Engineer3',
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
    const member = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addUser(project.id, member.id, projectUser.id, 'test');
    const { users } = await projectService.getAccessToProject(project.id);
    let memberUser = users.filter((u) => u.roleId === member.id);

    expect(memberUser).toHaveLength(1);
    expect(memberUser[0].id).toBe(projectUser.id);
    expect(memberUser[0].name).toBe(projectUser.name);
    await projectService.removeUser(
        project.id,
        member.id,
        projectUser.id,
        'test',
    );
    await projectService.addUser(
        project.id,
        customRole.id,
        projectUser.id,
        'test',
    );

    let { users: updatedUsers } = await projectService.getAccessToProject(
        project.id,
    );
    const customUser = updatedUsers.filter((u) => u.roleId === customRole.id);

    expect(customUser).toHaveLength(1);
    expect(customUser[0].id).toBe(projectUser.id);
    expect(customUser[0].name).toBe(projectUser.name);
});

test('should update role for user on project', async () => {
    const project = {
        id: 'update-users',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'update99@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);
    const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);

    await projectService.addUser(
        project.id,
        memberRole.id,
        projectMember1.id,
        'test',
    );
    await projectService.changeRole(
        project.id,
        ownerRole.id,
        projectMember1.id,
        'test',
    );

    const { users } = await projectService.getAccessToProject(project.id);
    const memberUsers = users.filter((u) => u.roleId === memberRole.id);
    const ownerUsers = users.filter((u) => u.roleId === ownerRole.id);

    expect(memberUsers).toHaveLength(0);
    expect(ownerUsers).toHaveLength(2);
});

test('should able to assign role without existing members', async () => {
    const project = {
        id: 'update-users-test',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'update1999@getunleash.io',
    });

    const testRole = await stores.roleStore.create({
        name: 'Power user',
        roleType: 'custom',
        description: 'Grants access to modify all environments',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addUser(
        project.id,
        memberRole.id,
        projectMember1.id,
        'test',
    );
    await projectService.changeRole(
        project.id,
        testRole.id,
        projectMember1.id,
        'test',
    );

    const { users } = await projectService.getAccessToProject(project.id);
    const memberUsers = users.filter((u) => u.roleId === memberRole.id);
    const testUsers = users.filter((u) => u.roleId === testRole.id);

    expect(memberUsers).toHaveLength(0);
    expect(testUsers).toHaveLength(1);
});

test('should not update role for user on project when she is the owner', async () => {
    const project = {
        id: 'update-users-not-allowed',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'update991@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addUser(
        project.id,
        memberRole.id,
        projectMember1.id,
        'test',
    );

    await expect(async () => {
        await projectService.changeRole(
            project.id,
            memberRole.id,
            user.id,
            'test',
        );
    }).rejects.toThrowError(
        new Error('A project must have at least one owner'),
    );
});

test('Should allow bulk update of group permissions', async () => {
    const project = {
        id: 'bulk-update-project',
        name: 'bulk-update-project',
    };
    await projectService.createProject(project, user.id);
    const groupStore = stores.groupStore;

    const user1 = await stores.userStore.insert({
        name: 'Vanessa Viewer',
        email: 'vanv@getunleash.io',
    });

    const group1 = await groupStore.create({
        name: 'ViewersOnly',
        description: '',
    });

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

    await projectService.addAccess(
        project.id,
        createFeatureRole.id,
        {
            users: [{ id: user1.id }],
            groups: [{ id: group1.id }],
        },
        'some-admin-user',
    );
});

test('Should bulk update of only users', async () => {
    const project = 'bulk-update-project-users';

    const user1 = await stores.userStore.insert({
        name: 'Van Viewer',
        email: 'vv@getunleash.io',
    });

    const createFeatureRole = await accessService.createRole({
        name: 'CreateRoleForUsers',
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

    await projectService.addAccess(
        project,
        createFeatureRole.id,
        {
            users: [{ id: user1.id }],
            groups: [],
        },
        'some-admin-user',
    );
});

test('Should allow bulk update of only groups', async () => {
    const project = {
        id: 'bulk-update-project-only',
        name: 'bulk-update-project-only',
    };
    const groupStore = stores.groupStore;

    await projectService.createProject(project, user.id);

    const group1 = await groupStore.create({
        name: 'ViewersOnly',
        description: '',
    });

    const createFeatureRole = await accessService.createRole({
        name: 'CreateRoleForGroups',
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

    await projectService.addAccess(
        project.id,
        createFeatureRole.id,
        {
            users: [],
            groups: [{ id: group1.id }],
        },
        'some-admin-user',
    );
});
