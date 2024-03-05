import dbInit, { ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import FeatureToggleService from '../../../lib/features/feature-toggle/feature-toggle-service';
import ProjectService from '../../../lib/features/project/project-service';
import { AccessService } from '../../../lib/services/access-service';
import { MOVE_FEATURE_TOGGLE } from '../../../lib/types/permissions';
import { createTestConfig } from '../../config/test-config';
import { RoleName } from '../../../lib/types/model';
import { randomId } from '../../../lib/util/random-id';
import EnvironmentService from '../../../lib/features/project-environments/environment-service';
import IncompatibleProjectError from '../../../lib/error/incompatible-project-error';
import { EventService } from '../../../lib/services';
import { FeatureEnvironmentEvent } from '../../../lib/types/events';
import { addDays, subDays } from 'date-fns';
import {
    createAccessService,
    createFeatureToggleService,
    createProjectService,
} from '../../../lib/features';
import {
    IGroup,
    IUnleashStores,
    IUser,
    SYSTEM_USER,
    SYSTEM_USER_ID,
} from '../../../lib/types';
import { User } from '../../../lib/server-impl';
import { InvalidOperationError } from '../../../lib/error';

let stores: IUnleashStores;
let db: ITestDb;

let projectService: ProjectService;
let accessService: AccessService;
let eventService: EventService;
let environmentService: EnvironmentService;
let featureToggleService: FeatureToggleService;
let user: User; // many methods in this test use User instead of IUser
let opsUser: IUser;
let group: IGroup;

const isProjectUser = async (
    userId: number,
    projectName: string,
    condition: boolean,
) => {
    expect(await projectService.isProjectUser(userId, projectName)).toBe(
        condition,
    );
};

beforeAll(async () => {
    db = await dbInit('project_service_serial', getLogger);
    stores = db.stores;
    // @ts-ignore return type IUser type missing generateImageUrl
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    group = await stores.groupStore.create({
        name: 'aTestGroup',
        description: '',
    });
    opsUser = await stores.userStore.insert({
        name: 'Test user',
        email: 'test@example.com',
    });
    await stores.accessStore.addUserToRole(opsUser.id, 1, '');
    const config = createTestConfig({
        getLogger,
    });
    eventService = new EventService(stores, config);
    accessService = createAccessService(db.rawDatabase, config);

    featureToggleService = createFeatureToggleService(db.rawDatabase, config);

    environmentService = new EnvironmentService(stores, config, eventService);
    projectService = createProjectService(db.rawDatabase, config);
});
beforeEach(async () => {
    await stores.accessStore.addUserToRole(opsUser.id, 1, '');
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
    await stores.eventStore.deleteAll();
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
        mode: 'open' as const,
        defaultStickiness: 'default',
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
        defaultStickiness: 'default',
    };

    await projectService.createProject(project, user);
    const ret = await projectService.getProject('test');
    expect(project.id).toEqual(ret.id);
    expect(project.name).toEqual(ret.name);
    expect(project.description).toEqual(ret.description);
    expect(ret.createdAt).toBeTruthy();
});

test('should create new private project', async () => {
    const project = {
        id: 'testPrivate',
        name: 'New private project',
        description: 'Blah',
        defaultStickiness: 'default',
    };

    await projectService.createProject(project, user);
    const ret = await projectService.getProject('testPrivate');
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
        mode: 'open' as const,
        defaultStickiness: 'default',
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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project, user);
    await stores.featureToggleStore.create(project.id, {
        name: 'test-project-delete',
        createdByUserId: 9999,
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
        mode: 'open' as const,
        defaultStickiness: 'default',
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
        mode: 'open' as const,
        defaultStickiness: 'default',
    };

    const updatedProject = {
        id: 'test-update',
        name: 'New name',
        description: 'Blah longer desc',
        mode: 'protected' as const,
        defaultStickiness: 'userId',
    };

    await projectService.createProject(project, user);
    await projectService.updateProject(updatedProject, user);

    const readProject = await projectService.getProject(project.id);

    expect(updatedProject.name).toBe(readProject.name);
    expect(updatedProject.description).toBe(readProject.description);
    expect(updatedProject.mode).toBe('protected');
    expect(updatedProject.defaultStickiness).toBe('userId');
});

test('should update project without existing settings', async () => {
    const project = {
        id: 'test-update-legacy',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'default',
    };

    const updatedProject = {
        id: 'test-update-legacy',
        name: 'New name',
        description: 'Blah longer desc',
        mode: 'protected' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user);
    await db
        .rawDatabase('project_settings')
        .del()
        .where({ project: project.id });
    await projectService.updateProject(updatedProject, user);

    const readProject = await projectService.getProject(project.id);

    expect(updatedProject.name).toBe(readProject.name);
    expect(updatedProject.description).toBe(readProject.description);
    expect(updatedProject.mode).toBe('protected');
    expect(updatedProject.defaultStickiness).toBe('clientId');
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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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

    await isProjectUser(users[0].id, project.id, true);
});

test('should add a member user to the project', async () => {
    const project = {
        id: 'add-users',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
    expect(await projectService.getProjectUsers(project.id)).toStrictEqual([
        { email: user.email, id: user.id, username: user.username },
        {
            email: projectMember1.email,
            id: projectMember1.id,
            username: projectMember1.username,
        },
        {
            email: projectMember2.email,
            id: projectMember2.id,
            username: projectMember2.username,
        },
    ]);
});

describe('Managing Project access', () => {
    test('Admin users should be allowed to add any project role', async () => {
        const project = {
            id: 'admin-project-admin',
            name: 'admin',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);
        const customRole = await stores.roleStore.create({
            name: 'my_custom_role_admin_user',
            roleType: 'custom',
            description:
                'Used to prove that you can assign a role when you are admin',
        });
        const projectUserAdmin = await stores.userStore.insert({
            name: 'Some project user',
            email: 'user_admin@example.com',
        });
        const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);

        expect(
            projectService.addAccess(
                project.id,
                [customRole.id, ownerRole.id],
                [],
                [projectUserAdmin.id],
                opsUser.username,
                opsUser.id,
            ),
        ).resolves.not.toThrow();
    });
    test('Users with project owner should be allowed to add any project role', async () => {
        const project = {
            id: 'project-owner',
            name: 'Owner',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);
        const projectAdmin = await stores.userStore.insert({
            name: 'Some project admin',
            email: 'admin@example.com',
        });
        const projectCustomer = await stores.userStore.insert({
            name: 'Some project customer',
            email: 'customer@example.com',
        });
        const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);
        await accessService.addUserToRole(
            projectAdmin.id,
            ownerRole.id,
            project.id,
        );
        const customRole = await stores.roleStore.create({
            name: 'my_custom_role',
            roleType: 'custom',
            description:
                'Used to prove that you can assign a role the project owner does not have',
        });
        expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [],
                [projectCustomer.id],
                projectAdmin.username,
                projectAdmin.id,
            ),
        ).resolves;
    });
    test('Users with project role should only be allowed to grant same role to others', async () => {
        const project = {
            id: 'project_role',
            name: 'custom_role',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);
        const projectUser = await stores.userStore.insert({
            name: 'Some project user',
            email: 'user@example.com',
        });
        const secondUser = await stores.userStore.insert({
            name: 'Some other user',
            email: 'otheruser@example.com',
        });
        const customRole = await stores.roleStore.create({
            name: 'my_custom_role_project_role',
            roleType: 'custom',
            description:
                'Used to prove that you can assign a role the project owner does not have',
        });
        await accessService.addUserToRole(
            projectUser.id,
            customRole.id,
            project.id,
        );
        const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);
        expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [],
                [secondUser.id],
                projectUser.username,
                projectUser.id,
            ),
        ).resolves.not.toThrow();
        expect(
            projectService.addAccess(
                project.id,
                [ownerRole.id],
                [],
                [secondUser.id],
                projectUser.username,
                projectUser.id,
            ),
        ).rejects.toThrow();
    });
    test('Users that are members of a group with project role should only be allowed to grant same role to others', async () => {
        const project = {
            id: 'project_group_role',
            name: 'custom_role',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);
        const projectUser = await stores.userStore.insert({
            name: 'Some project user',
            email: 'user_with_group_membership@example.com',
        });
        const group = await stores.groupStore.create({
            name: 'custom_group_for_role_access',
        });
        await stores.groupStore.addUsersToGroup(
            group.id,
            [{ user: { id: projectUser.id } }],
            opsUser.username,
        );
        const secondUser = await stores.userStore.insert({
            name: 'Some other user',
            email: 'otheruser_from_group_members@example.com',
        });
        const customRole = await stores.roleStore.create({
            name: 'my_custom_role_from_group_members',
            roleType: 'custom',
            description:
                'Used to prove that you can assign a role via a group membership',
        });
        await accessService.addGroupToRole(
            group.id,
            customRole.id,
            opsUser.username,
            project.id,
        );
        const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);
        const otherGroup = await stores.groupStore.create({
            name: 'custom_group_to_receive_new_access',
        });
        expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [],
                [secondUser.id],
                projectUser.username,
                projectUser.id,
            ),
        ).resolves.not.toThrow();
        expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [otherGroup.id],
                [],
                projectUser.username,
                projectUser.id,
            ),
        ).resolves.not.toThrow();
        expect(
            projectService.addAccess(
                project.id,
                [ownerRole.id],
                [],
                [secondUser.id],
                projectUser.username,
                projectUser.id,
            ),
        ).rejects.toThrow();
    });
    test('Users can assign roles they have to a group', async () => {
        const project = {
            id: 'user_assign_to_group',
            name: 'user_assign_to_group',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);
        const projectUser = await stores.userStore.insert({
            name: 'Some project user',
            email: 'assign_role_to_group@example.com',
        });
        const secondGroup = await stores.groupStore.create({
            name: 'custom_group_awaiting_new_role',
        });
        const customRole = await stores.roleStore.create({
            name: 'role_assigned_to_group',
            roleType: 'custom',
            description:
                'Used to prove that you can assign a role via a group membership',
        });
        await accessService.addUserToRole(
            projectUser.id,
            customRole.id,
            project.id,
        );
        expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [secondGroup.id],
                [],
                projectUser.username,
                projectUser.id,
            ),
        ).resolves.not.toThrow(
            new InvalidOperationError(
                'User tried to assign a role they did not have access to',
            ),
        );
    });
    test('Users can not assign roles they do not have to a user through explicit roles endpoint', async () => {
        const project = {
            id: 'user_fail_assign_to_user',
            name: 'user_fail_assign_to_user',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);
        const projectUser = await stores.userStore.insert({
            name: 'Some project user',
            email: 'fail_assign_role_to_user@example.com',
        });
        const secondUser = await stores.userStore.insert({
            name: 'Some other user',
            email: 'otheruser_no_roles@example.com',
        });
        const customRole = await stores.roleStore.create({
            name: 'role_that_noone_has',
            roleType: 'custom',
            description:
                'Used to prove that you can not assign a role you do not have via setRolesForUser',
        });
        expect(
            projectService.setRolesForUser(
                project.id,
                secondUser.id,
                [customRole.id],
                projectUser.username,
                projectUser.id,
            ),
        ).rejects.toThrow();
    });
    test('Users can not assign roles they do not have to a group through explicit roles endpoint', async () => {
        const project = {
            id: 'user_fail_assign_to_group',
            name: 'user_fail_assign_to_group',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);
        const projectUser = await stores.userStore.insert({
            name: 'Some project user',
            email: 'fail_assign_role_to_group@example.com',
        });
        const group = await stores.groupStore.create({
            name: 'Some group_awaiting_role',
        });
        const customRole = await stores.roleStore.create({
            name: 'role_that_noone_has_fail_assign_group',
            roleType: 'custom',
            description:
                'Used to prove that you can not assign a role you do not have via setRolesForGroup',
        });
        expect(
            projectService.setRolesForGroup(
                project.id,
                group.id,
                [customRole.id],
                projectUser.username,
                projectUser.id,
            ),
        ).rejects.toThrow(
            new InvalidOperationError(
                'User tried to assign a role they did not have access to',
            ),
        );
    });
});

test('should add admin users to the project', async () => {
    const project = {
        id: 'add-admin-users',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
    await isProjectUser(adminUsers[0].id, project.id, true);
    await isProjectUser(adminUsers[1].id, project.id, true);
    await isProjectUser(adminUsers[2].id, project.id, true);
});

test('add user should fail if user already have access', async () => {
    const project = {
        id: 'add-users-twice',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
        opsUser.id,
    );

    const { users } = await projectService.getAccessToProject(project.id);
    const memberUsers = users.filter((u) => u.roleId === memberRole.id);

    expect(memberUsers).toHaveLength(0);
});

test('should not change project if feature toggle project does not match current project id', async () => {
    const project = {
        id: 'test-change-project',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    const toggle = { name: 'test-toggle' };

    await projectService.createProject(project, user);
    await featureToggleService.createFeatureToggle(
        project.id,
        toggle,
        user.email,
        opsUser.id,
    );

    try {
        await projectService.changeProject(
            'newProject',
            toggle.name,
            user,
            'wrong-project-id',
        );
    } catch (err) {
        expect(err.message.toLowerCase().includes('permission')).toBeTruthy();
        expect(err.message.includes(MOVE_FEATURE_TOGGLE)).toBeTruthy();
    }
});

test('should return 404 if no project is found with the project id', async () => {
    const project = {
        id: 'test-change-project-2',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    const toggle = { name: 'test-toggle-2' };

    await projectService.createProject(project, user);
    await featureToggleService.createFeatureToggle(
        project.id,
        toggle,
        user.email,
        opsUser.id,
    );

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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    const projectDestination = {
        id: 'test-change-project-dest',
        name: 'New project 2',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    const toggle = { name: 'test-toggle-3' };
    const projectAdmin1 = await stores.userStore.insert({
        name: 'test-change-project-creator',
        email: 'admin-change-project@getunleash.io',
    });

    await projectService.createProject(project, user);
    await projectService.createProject(projectDestination, projectAdmin1);
    await featureToggleService.createFeatureToggle(
        project.id,
        toggle,
        user.email,
        opsUser.id,
    );

    try {
        await projectService.changeProject(
            projectDestination.id,
            toggle.name,
            user,
            project.id,
        );
    } catch (err) {
        expect(err.message.toLowerCase().includes('permission')).toBeTruthy();
        expect(err.message.includes(MOVE_FEATURE_TOGGLE)).toBeTruthy();
    }
});

test('should change project when checks pass', async () => {
    const projectA = {
        id: randomId(),
        name: randomId(),
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    const projectB = {
        id: randomId(),
        name: randomId(),
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    const toggle = { name: randomId() };

    await projectService.createProject(projectA, user);
    await projectService.createProject(projectB, user);
    await featureToggleService.createFeatureToggle(
        projectA.id,
        toggle,
        user.email,
        opsUser.id,
    );
    await projectService.changeProject(
        projectB.id,
        toggle.name,
        user,
        projectA.id,
    );

    const updatedFeature = await featureToggleService.getFeature({
        featureName: toggle.name,
    });
    expect(updatedFeature.project).toBe(projectB.id);
});

test('changing project should emit event even if user does not have a username set', async () => {
    const projectA = {
        id: randomId(),
        name: randomId(),
        mode: 'open' as const,
        defaultStickiness: 'default',
    };
    const projectB = {
        id: randomId(),
        name: randomId(),
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    const toggle = { name: randomId() };
    await projectService.createProject(projectA, user);
    await projectService.createProject(projectB, user);
    await featureToggleService.createFeatureToggle(
        projectA.id,
        toggle,
        user.email,
        opsUser.id,
    );
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
    const projectA = {
        id: randomId(),
        name: randomId(),
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    const projectB = {
        id: randomId(),
        name: randomId(),
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    const environment = { name: randomId(), type: 'production' };
    const toggle = { name: randomId() };

    await projectService.createProject(projectA, user);
    await projectService.createProject(projectB, user);
    await featureToggleService.createFeatureToggle(
        projectA.id,
        toggle,
        user.email,
        opsUser.id,
    );
    await stores.environmentStore.create(environment);
    await environmentService.addEnvironmentToProject(
        environment.name,
        projectB.id,
        'test',
        opsUser.id,
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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
    expect(
        connectedEnvs.some((e) => e.environment === enabledEnv),
    ).toBeTruthy();
    expect(
        connectedEnvs.some((e) => e.environment === disabledEnv),
    ).toBeFalsy();
});

test('should have environments sorted in order', async () => {
    const project = {
        id: 'environment-order-test',
        name: 'Environment testing project',
        description: '',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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

    expect(connectedEnvs.map((e) => e.environment)).toEqual([
        'default',
        first,
        second,
        third,
        fourth,
    ]);
});

test('should add a user to the project with a custom role', async () => {
    const project = {
        id: 'add-users-custom-role',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
                id: 2, // CREATE_FEATURE
            },
            {
                id: 8, // DELETE_FEATURE
            },
        ],
        createdByUserId: SYSTEM_USER_ID,
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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
                id: 2, // CREATE_FEATURE
            },
            {
                id: 8, // DELETE_FEATURE
            },
        ],
        createdByUserId: SYSTEM_USER_ID,
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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
                id: 2, // CREATE_FEATURE
            },
            {
                id: 8, // DELETE_FEATURE
            },
        ],
        createdByUserId: SYSTEM_USER_ID,
    });
    const member = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addUser(project.id, member.id, projectUser.id, 'test');
    const { users } = await projectService.getAccessToProject(project.id);
    const memberUser = users.filter((u) => u.roleId === member.id);

    expect(memberUser).toHaveLength(1);
    expect(memberUser[0].id).toBe(projectUser.id);
    expect(memberUser[0].name).toBe(projectUser.name);
    await projectService.removeUser(
        project.id,
        member.id,
        projectUser.id,
        'test',
        opsUser.id,
    );
    await projectService.addUser(
        project.id,
        customRole.id,
        projectUser.id,
        'test',
    );

    const { users: updatedUsers } = await projectService.getAccessToProject(
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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
        opsUser.id,
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
        mode: 'open' as const,
        defaultStickiness: 'clientId',
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
        opsUser.id,
    );

    const { users } = await projectService.getAccessToProject(project.id);
    const memberUsers = users.filter((u) => u.roleId === memberRole.id);
    const testUsers = users.filter((u) => u.roleId === testRole.id);

    expect(memberUsers).toHaveLength(0);
    expect(testUsers).toHaveLength(1);
});

describe('ensure project has at least one owner', () => {
    test('should not remove user from the project', async () => {
        const project = {
            id: 'remove-users-not-allowed',
            name: 'New project',
            description: 'Blah',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);

        const roles = await stores.roleStore.getRolesForProject(project.id);
        const ownerRole = roles.find((r) => r.name === RoleName.OWNER)!;

        await expect(async () => {
            await projectService.removeUser(
                project.id,
                ownerRole.id,
                user.id,
                'test',
                opsUser.id,
            );
        }).rejects.toThrowError(
            new Error('A project must have at least one owner'),
        );

        await expect(async () => {
            await projectService.removeUserAccess(
                project.id,
                user.id,
                'test',
                opsUser.id,
            );
        }).rejects.toThrowError(
            new Error('A project must have at least one owner'),
        );
    });

    test('should be able to remove member user from the project when another is owner', async () => {
        const project = {
            id: 'remove-users-members-allowed',
            name: 'New project',
            description: 'Blah',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);

        const memberRole = await stores.roleStore.getRoleByName(
            RoleName.MEMBER,
        );

        const memberUser = await stores.userStore.insert({
            name: 'Some Name',
            email: 'member@getunleash.io',
        });

        await projectService.addAccess(
            project.id,
            [memberRole.id],
            [],
            [memberUser.id],
            'test',
            opsUser.id,
        );

        const usersBefore = await projectService.getProjectUsers(project.id);
        await projectService.removeUserAccess(
            project.id,
            memberUser.id,
            'test',
            opsUser.id,
        );
        const usersAfter = await projectService.getProjectUsers(project.id);
        expect(usersBefore).toHaveLength(2);
        expect(usersAfter).toHaveLength(1);
    });

    test('should not update role for user on project when she is the owner', async () => {
        const project = {
            id: 'update-users-not-allowed',
            name: 'New project',
            description: 'Blah',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);

        const projectMember1 = await stores.userStore.insert({
            name: 'Some Member',
            email: 'update991@getunleash.io',
        });

        const memberRole = await stores.roleStore.getRoleByName(
            RoleName.MEMBER,
        );

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
                opsUser.id,
            );
        }).rejects.toThrowError(
            new Error('A project must have at least one owner'),
        );

        await expect(async () => {
            await projectService.setRolesForUser(
                project.id,
                user.id,
                [memberRole.id],
                'test',
                opsUser.id,
            );
        }).rejects.toThrowError(
            new Error('A project must have at least one owner'),
        );
    });

    async function projectWithGroupOwner(projectId: string) {
        const project = {
            id: projectId,
            name: 'New project',
            description: 'Blah',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user);

        const roles = await stores.roleStore.getRolesForProject(project.id);
        const ownerRole = roles.find((r) => r.name === RoleName.OWNER)!;

        await projectService.addGroup(
            project.id,
            ownerRole.id,
            group.id,
            'test',
            opsUser.id,
        );

        // this should be fine, leaving the group as the only owner
        // note group has zero members, but it still acts as an owner
        await projectService.removeUser(
            project.id,
            ownerRole.id,
            user.id,
            'test',
            opsUser.id,
        );

        return {
            project,
            group,
            ownerRole,
        };
    }

    test('should not remove group from the project', async () => {
        const { project, group, ownerRole } = await projectWithGroupOwner(
            'remove-group-not-allowed',
        );

        await expect(async () => {
            await projectService.removeGroup(
                project.id,
                ownerRole.id,
                group.id,
                'test',
                opsUser.id,
            );
        }).rejects.toThrowError(
            new Error('A project must have at least one owner'),
        );

        await expect(async () => {
            await projectService.removeGroupAccess(
                project.id,
                group.id,
                'test',
                opsUser.id,
            );
        }).rejects.toThrowError(
            new Error('A project must have at least one owner'),
        );
    });

    test('should not update role for group on project when she is the owner', async () => {
        const { project, group } = await projectWithGroupOwner(
            'update-group-not-allowed',
        );
        const memberRole = await stores.roleStore.getRoleByName(
            RoleName.MEMBER,
        );

        await expect(async () => {
            await projectService.changeGroupRole(
                project.id,
                memberRole.id,
                group.id,
                'test',
                opsUser.id,
            );
        }).rejects.toThrowError(
            new Error('A project must have at least one owner'),
        );

        await expect(async () => {
            await projectService.setRolesForGroup(
                project.id,
                group.id,
                [memberRole.id],
                'test',
                opsUser.id,
            );
        }).rejects.toThrowError(
            new Error('A project must have at least one owner'),
        );
    });
});

test('Should allow bulk update of group permissions', async () => {
    const project = {
        id: 'bulk-update-project',
        name: 'bulk-update-project',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project, user);
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
                id: 2, // CREATE_FEATURE
            },
        ],
        createdByUserId: SYSTEM_USER_ID,
    });
    await stores.accessStore.addUserToRole(
        opsUser.id,
        createFeatureRole.id,
        project.id,
    );

    await projectService.addAccess(
        project.id,
        [createFeatureRole.id],
        [group1.id],
        [user1.id],
        'some-admin-user',
        opsUser.id,
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
                id: 2, // CREATE_FEATURE
            },
        ],
        createdByUserId: SYSTEM_USER_ID,
    });

    await projectService.addAccess(
        project,
        [createFeatureRole.id],
        [],
        [user1.id],
        'some-admin-user',
        opsUser.id,
    );
});

test('Should allow bulk update of only groups', async () => {
    const project = {
        id: 'bulk-update-project-only',
        name: 'bulk-update-project-only',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    const groupStore = stores.groupStore;

    await projectService.createProject(project, user);

    const group1 = await groupStore.create({
        name: 'ViewersOnly',
        description: '',
    });

    const createFeatureRole = await accessService.createRole({
        name: 'CreateRoleForGroups',
        description: '',
        permissions: [
            {
                id: 2, // CREATE_FEATURE
            },
        ],
        createdByUserId: SYSTEM_USER_ID,
    });

    await projectService.addAccess(
        project.id,
        [createFeatureRole.id],
        [group1.id],
        [],
        'some-admin-user',
        opsUser.id,
    );
});

test('Should allow permutations of roles, groups and users when adding a new access', async () => {
    const project = {
        id: 'project-access-permutations',
        name: 'project-access-permutations',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user);

    const group1 = await stores.groupStore.create({
        name: 'permutation-group-1',
        description: '',
    });

    const group2 = await stores.groupStore.create({
        name: 'permutation-group-2',
        description: '',
    });

    const user1 = await stores.userStore.insert({
        name: 'permutation-user-1',
        email: 'pu1@getunleash.io',
    });

    const user2 = await stores.userStore.insert({
        name: 'permutation-user-2',
        email: 'pu2@getunleash.io',
    });

    const role1 = await accessService.createRole({
        name: 'permutation-role-1',
        description: '',
        permissions: [
            {
                id: 2, // CREATE_FEATURE
            },
        ],
        createdByUserId: SYSTEM_USER_ID,
    });

    const role2 = await accessService.createRole({
        name: 'permutation-role-2',
        description: '',
        permissions: [
            {
                id: 7, // UPDATE_FEATURE
            },
        ],
        createdByUserId: SYSTEM_USER_ID,
    });

    await projectService.addAccess(
        project.id,
        [role1.id, role2.id],
        [group1.id, group2.id],
        [user1.id, user2.id],
        'some-admin-user',
        opsUser.id,
    );

    const { users, groups } = await projectService.getAccessToProject(
        project.id,
    );
    const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);

    expect(users).toHaveLength(3); // the 2 added plus the one that created the project
    expect(groups).toHaveLength(2);

    expect(users[0].roles).toStrictEqual([ownerRole.id]);
    expect(users[1].roles).toStrictEqual([role1.id, role2.id]);
    expect(groups[0].roles).toStrictEqual([role1.id, role2.id]);
});

test('should only count active feature toggles for project', async () => {
    const project = {
        id: 'only-active',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user);

    await stores.featureToggleStore.create(project.id, {
        name: 'only-active-t1',
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create(project.id, {
        name: 'only-active-t2',
        createdByUserId: 9999,
    });

    await featureToggleService.archiveToggle('only-active-t2', user);

    const projects = await projectService.getProjects();
    const theProject = projects.find((p) => p.id === project.id);
    expect(theProject?.featureCount).toBe(1);
});

test('should list projects with all features archived', async () => {
    const project = {
        id: 'only-archived',
        name: 'Listed project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user);

    await stores.featureToggleStore.create(project.id, {
        name: 'archived-toggle',
        createdByUserId: 9999,
    });

    await featureToggleService.archiveToggle('archived-toggle', user);

    const projects = await projectService.getProjects();
    const theProject = projects.find((p) => p.id === project.id);
    expect(theProject?.featureCount).toBe(0);
});

const updateEventCreatedAt = async (date: Date, featureName: string) => {
    return db.rawDatabase
        .table('events')
        .update({ created_at: date })
        .where({ feature_name: featureName });
};

const updateFeature = async (featureName: string, update: any) => {
    return db.rawDatabase
        .table('features')
        .update(update)
        .where({ name: featureName });
};

test('should calculate average time to production', async () => {
    const project = {
        id: 'average-time-to-prod',
        name: 'average-time-to-prod',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user);

    const toggles = [
        { name: 'average-prod-time' },
        { name: 'average-prod-time-2' },
        { name: 'average-prod-time-3' },
        { name: 'average-prod-time-4' },
        { name: 'average-prod-time-5' },
    ];

    const featureToggles = await Promise.all(
        toggles.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project.id,
                toggle,
                user.email,
                opsUser.id,
            );
        }),
    );

    await Promise.all(
        featureToggles.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project.id,
                    featureName: toggle.name,
                    environment: 'default',
                    createdBy: 'Fredrik',
                    createdByUserId: opsUser.id,
                }),
            );
        }),
    );

    await updateEventCreatedAt(subDays(new Date(), 31), 'average-prod-time-5');

    await Promise.all(
        featureToggles.map((toggle) =>
            updateFeature(toggle.name, { created_at: subDays(new Date(), 15) }),
        ),
    );

    await updateFeature('average-prod-time-5', {
        created_at: subDays(new Date(), 33),
    });

    const result = await projectService.getStatusUpdates(project.id);
    expect(result.updates.avgTimeToProdCurrentWindow).toBe(11.4);
});

test('should calculate average time to production ignoring some items', async () => {
    const project = {
        id: 'average-time-to-prod-corner-cases',
        name: 'average-time-to-prod',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    const makeEvent = (featureName: string) => ({
        enabled: true,
        project: project.id,
        featureName,
        environment: 'default',
        createdBy: 'Fredrik',
        createdByUserId: opsUser.id,
        tags: [],
    });

    await projectService.createProject(project, user);
    await stores.environmentStore.create({
        name: 'customEnv',
        type: 'development',
    });
    await environmentService.addEnvironmentToProject(
        'customEnv',
        project.id,
        SYSTEM_USER.username,
        SYSTEM_USER.id,
    );

    // actual toggle we take for calculations
    const toggle = { name: 'main-toggle' };
    await featureToggleService.createFeatureToggle(
        project.id,
        toggle,
        user.email,
        opsUser.id,
    );
    await updateFeature(toggle.name, {
        created_at: subDays(new Date(), 20),
    });
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(toggle.name)),
    );
    // ignore events added after first enabled
    await updateEventCreatedAt(addDays(new Date(), 1), toggle.name);
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(toggle.name)),
    );

    // ignore toggles enabled in non-prod envs
    const devToggle = { name: 'dev-toggle' };
    await featureToggleService.createFeatureToggle(
        project.id,
        devToggle,
        user.email,
        opsUser.id,
    );
    await eventService.storeEvent(
        new FeatureEnvironmentEvent({
            ...makeEvent(devToggle.name),
            environment: 'customEnv',
        }),
    );

    // ignore toggles from other projects
    const otherProjectToggle = { name: 'other-project' };
    await featureToggleService.createFeatureToggle(
        'default',
        otherProjectToggle,
        user.email,
        opsUser.id,
    );
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(otherProjectToggle.name)),
    );

    // ignore non-release toggles
    const nonReleaseToggle = { name: 'permission-toggle', type: 'permission' };
    await featureToggleService.createFeatureToggle(
        project.id,
        nonReleaseToggle,
        user.email,
        opsUser.id,
    );
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(nonReleaseToggle.name)),
    );

    // ignore toggles with events before toggle creation time
    const previouslyDeleteToggle = { name: 'previously-deleted' };
    await featureToggleService.createFeatureToggle(
        project.id,
        previouslyDeleteToggle,
        user.email,
        opsUser.id,
    );
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(previouslyDeleteToggle.name)),
    );
    await updateEventCreatedAt(
        subDays(new Date(), 30),
        previouslyDeleteToggle.name,
    );

    const result = await projectService.getStatusUpdates(project.id);
    expect(result.updates.avgTimeToProdCurrentWindow).toBe(20);
});

test('should get correct amount of features created in current and past window', async () => {
    const project = {
        id: 'features-created',
        name: 'features-created',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user);

    const toggles = [
        { name: 'features-created' },
        { name: 'features-created-2' },
        { name: 'features-created-3' },
        { name: 'features-created-4' },
    ];

    await Promise.all(
        toggles.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project.id,
                toggle,
                user.email,
                opsUser.id,
            );
        }),
    );

    await Promise.all([
        updateFeature(toggles[2].name, { created_at: subDays(new Date(), 31) }),
        updateFeature(toggles[3].name, { created_at: subDays(new Date(), 31) }),
    ]);

    const result = await projectService.getStatusUpdates(project.id);
    expect(result.updates.createdCurrentWindow).toBe(2);
    expect(result.updates.createdPastWindow).toBe(2);
});

test('should get correct amount of features archived in current and past window', async () => {
    const project = {
        id: 'features-archived',
        name: 'features-archived',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user);

    const toggles = [
        { name: 'features-archived' },
        { name: 'features-archived-2' },
        { name: 'features-archived-3' },
        { name: 'features-archived-4' },
    ];

    await Promise.all(
        toggles.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project.id,
                toggle,
                user.email,
                opsUser.id,
            );
        }),
    );

    await Promise.all([
        updateFeature(toggles[0].name, {
            archived_at: new Date(),
        }),
        updateFeature(toggles[1].name, {
            archived_at: new Date(),
        }),
        updateFeature(toggles[2].name, {
            archived_at: subDays(new Date(), 31),
        }),
        updateFeature(toggles[3].name, {
            archived_at: subDays(new Date(), 31),
        }),
    ]);

    const result = await projectService.getStatusUpdates(project.id);
    expect(result.updates.archivedCurrentWindow).toBe(2);
    expect(result.updates.archivedPastWindow).toBe(2);
});

test('should get correct amount of project members for current and past window', async () => {
    const project = {
        id: 'features-members',
        name: 'features-members',
        mode: 'open' as const,
        defaultStickiness: 'default',
    };

    await projectService.createProject(project, user);

    const users = [
        { name: 'memberOne', email: 'memberOne@getunleash.io' },
        { name: 'memberTwo', email: 'memberTwo@getunleash.io' },
        { name: 'memberThree', email: 'memberThree@getunleash.io' },
        { name: 'memberFour', email: 'memberFour@getunleash.io' },
        { name: 'memberFive', email: 'memberFive@getunleash.io' },
    ];

    const createdUsers = await Promise.all(
        users.map((userObj) => stores.userStore.insert(userObj)),
    );
    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await Promise.all(
        createdUsers.map((createdUser) =>
            projectService.addUser(
                project.id,
                memberRole.id,
                createdUser.id,
                'test',
            ),
        ),
    );

    const result = await projectService.getStatusUpdates(project.id);
    expect(result.updates.projectMembersAddedCurrentWindow).toBe(6); // 5 members + 1 owner
    expect(result.updates.projectActivityCurrentWindow).toBe(6);
    expect(result.updates.projectActivityPastWindow).toBe(0);
});

test('should return average time to production per toggle', async () => {
    const project = {
        id: 'average-time-to-prod-per-toggle',
        name: 'average-time-to-prod-per-toggle',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user);

    const toggles = [
        { name: 'average-prod-time-pt', subdays: 7 },
        { name: 'average-prod-time-pt-2', subdays: 14 },
        { name: 'average-prod-time-pt-3', subdays: 40 },
        { name: 'average-prod-time-pt-4', subdays: 15 },
        { name: 'average-prod-time-pt-5', subdays: 2 },
    ];

    const featureToggles = await Promise.all(
        toggles.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project.id,
                toggle,
                user.email,
                opsUser.id,
            );
        }),
    );

    await Promise.all(
        featureToggles.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project.id,
                    featureName: toggle.name,
                    environment: 'default',
                    createdBy: 'Fredrik',
                    createdByUserId: opsUser.id,
                }),
            );
        }),
    );

    await Promise.all(
        toggles.map((toggle) =>
            updateFeature(toggle.name, {
                created_at: subDays(new Date(), toggle.subdays),
            }),
        ),
    );

    const result = await projectService.getDoraMetrics(project.id);

    expect(result.features).toHaveLength(5);
    expect(result.features[0].timeToProduction).toBeTruthy();
    expect(result.projectAverage).toBeTruthy();
});

test('should return average time to production per toggle for a specific project', async () => {
    const project1 = {
        id: 'average-time-to-prod-per-toggle-1',
        name: 'Project 1',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    const project2 = {
        id: 'average-time-to-prod-per-toggle-2',
        name: 'Project 2',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project1, user);
    await projectService.createProject(project2, user);

    const togglesProject1 = [
        { name: 'average-prod-time-pt-10', subdays: 7 },
        { name: 'average-prod-time-pt-11', subdays: 14 },
        { name: 'average-prod-time-pt-12', subdays: 40 },
    ];

    const togglesProject2 = [
        { name: 'average-prod-time-pt-13', subdays: 15 },
        { name: 'average-prod-time-pt-14', subdays: 2 },
    ];

    const featureTogglesProject1 = await Promise.all(
        togglesProject1.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project1.id,
                toggle,
                user.email,
                opsUser.id,
            );
        }),
    );

    const featureTogglesProject2 = await Promise.all(
        togglesProject2.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project2.id,
                toggle,
                user.email,
                opsUser.id,
            );
        }),
    );

    await Promise.all(
        featureTogglesProject1.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project1.id,
                    featureName: toggle.name,
                    environment: 'default',
                    createdBy: 'Fredrik',
                    createdByUserId: opsUser.id,
                }),
            );
        }),
    );

    await Promise.all(
        featureTogglesProject2.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project2.id,
                    featureName: toggle.name,
                    environment: 'default',
                    createdBy: 'Fredrik',
                    createdByUserId: opsUser.id,
                }),
            );
        }),
    );

    await Promise.all(
        togglesProject1.map((toggle) =>
            updateFeature(toggle.name, {
                created_at: subDays(new Date(), toggle.subdays),
            }),
        ),
    );

    await Promise.all(
        togglesProject2.map((toggle) =>
            updateFeature(toggle.name, {
                created_at: subDays(new Date(), toggle.subdays),
            }),
        ),
    );

    const resultProject1 = await projectService.getDoraMetrics(project1.id);
    const resultProject2 = await projectService.getDoraMetrics(project2.id);

    expect(resultProject1.features).toHaveLength(3);
    expect(resultProject2.features).toHaveLength(2);
});

test('should return average time to production per toggle and include archived toggles', async () => {
    const project1 = {
        id: 'average-time-to-prod-per-toggle-12',
        name: 'Project 1',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project1, user);

    const togglesProject1 = [
        { name: 'average-prod-time-pta-10', subdays: 7 },
        { name: 'average-prod-time-pta-11', subdays: 14 },
        { name: 'average-prod-time-pta-12', subdays: 40 },
    ];

    const featureTogglesProject1 = await Promise.all(
        togglesProject1.map((toggle) => {
            return featureToggleService.createFeatureToggle(
                project1.id,
                toggle,
                user.email,
                opsUser.id,
            );
        }),
    );

    await Promise.all(
        featureTogglesProject1.map((toggle) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project1.id,
                    featureName: toggle.name,
                    environment: 'default',
                    createdBy: 'Fredrik',
                    createdByUserId: opsUser.id,
                }),
            );
        }),
    );

    await Promise.all(
        togglesProject1.map((toggle) =>
            updateFeature(toggle.name, {
                created_at: subDays(new Date(), toggle.subdays),
            }),
        ),
    );

    await featureToggleService.archiveToggle('average-prod-time-pta-12', user);

    const resultProject1 = await projectService.getDoraMetrics(project1.id);

    expect(resultProject1.features).toHaveLength(3);
});

describe('feature flag naming patterns', () => {
    test(`should clear existing example and description if the payload doesn't contain them`, async () => {
        const featureNaming = {
            pattern: '.+',
            example: 'example',
            description: 'description',
        };

        const project = {
            id: 'feature-flag-naming-patterns-cleanup',
            name: 'Project',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
            description: 'description',
            featureNaming,
        };

        await projectService.createProject(project, user);

        await projectService.updateProjectEnterpriseSettings(project, user);

        expect(
            (await projectService.getProject(project.id)).featureNaming,
        ).toMatchObject(featureNaming);

        const newPattern = 'new-pattern.+';
        await projectService.updateProjectEnterpriseSettings(
            {
                ...project,
                featureNaming: { pattern: newPattern },
            },
            user,
        );
        const { events } = await eventService.getEvents();
        expect(events[0]).toMatchObject({
            preData: events[0].preData,
            data: {
                ...events[0].preData,
                featureNaming: events[0].data.featureNaming,
            },
        });

        const updatedProject = await projectService.getProject(project.id);

        expect(updatedProject.featureNaming!.pattern).toBe(newPattern);
        expect(updatedProject.featureNaming!.example).toBeFalsy();
        expect(updatedProject.featureNaming!.description).toBeFalsy();
    });
});

test('deleting a project with archived toggles should result in any remaining archived toggles being deleted', async () => {
    const project = {
        id: 'project-with-archived-toggles',
        name: 'project-with-archived-toggles',
    };
    const toggleName = 'archived-and-deleted';

    await projectService.createProject(project, user);

    await stores.featureToggleStore.create(project.id, {
        name: toggleName,
        createdByUserId: 9999,
    });

    await stores.featureToggleStore.archive(toggleName);
    await projectService.deleteProject(project.id, user);

    // bring the project back again, previously this would allow those archived toggles to be resurrected
    // we now expect them to be deleted correctly
    await projectService.createProject(project, user);

    const toggles = await stores.featureToggleStore.getAll({
        project: project.id,
        archived: true,
    });

    expect(toggles.find((t) => t.name === toggleName)).toBeUndefined();
});

test('deleting a project with no archived toggles should not result in an error', async () => {
    const project = {
        id: 'project-with-nothing',
        name: 'project-with-nothing',
    };

    await projectService.createProject(project, user);
    await projectService.deleteProject(project.id, user);
});

test('should get project settings with mode', async () => {
    const projectOne = {
        id: 'mode-private',
        name: 'New project',
        description: 'Desc',
        mode: 'open' as const,
        defaultStickiness: 'default',
    };

    const projectTwo = {
        id: 'mode-open',
        name: 'New project',
        description: 'Desc',
        mode: 'open' as const,
        defaultStickiness: 'default',
    };

    const updatedProject = {
        id: 'mode-private',
        name: 'New name',
        description: 'Desc',
        mode: 'private' as const,
        defaultStickiness: 'clientId',
    };

    const { mode, id, ...rest } = updatedProject;

    await projectService.createProject(projectOne, user);
    await projectService.createProject(projectTwo, user);
    await projectService.updateProject({ id, ...rest }, user);
    await projectService.updateProjectEnterpriseSettings({ mode, id }, user);

    const projects = await projectService.getProjects();
    const foundProjectOne = projects.find(
        (project) => projectOne.id === project.id,
    );
    const foundProjectTwo = projects.find(
        (project) => projectTwo.id === project.id,
    );

    expect(foundProjectOne!.mode).toBe('private');
    expect(foundProjectOne!.defaultStickiness).toBe('clientId');
    expect(foundProjectTwo!.mode).toBe('open');
    expect(foundProjectTwo!.defaultStickiness).toBe('default');
});
