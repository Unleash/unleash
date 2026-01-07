import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { FeatureToggleService } from '../feature-toggle/feature-toggle-service.js';
import type ProjectService from './project-service.js';
import type { AccessService } from '../../services/index.js';
import { MOVE_FEATURE_TOGGLE } from '../../types/permissions.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import { RoleName } from '../../types/model.js';
import { randomId } from '../../util/index.js';
import EnvironmentService from '../project-environments/environment-service.js';
import IncompatibleProjectError from '../../error/incompatible-project-error.js';
import type { ApiTokenService, EventService } from '../../services/index.js';
import { FeatureEnvironmentEvent } from '../../types/index.js';
import { addDays, subDays } from 'date-fns';
import {
    createAccessService,
    createEventsService,
    createFeatureToggleService,
    createProjectService,
} from '../index.js';
import {
    type IAuditUser,
    type IUnleashStores,
    type IUser,
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
    TEST_AUDIT_USER,
} from '../../types/index.js';
import { BadDataError, InvalidOperationError } from '../../error/index.js';
import { extractAuditInfoFromUser } from '../../util/index.js';
import { ApiTokenType } from '../../types/model.js';
import { createApiTokenService } from '../api-tokens/createApiTokenService.js';
import type User from '../../types/user.js';
import { beforeAll, expect, test, beforeEach, afterAll } from 'vitest';
let stores: IUnleashStores;
let db: ITestDb;

let projectService: ProjectService;
let accessService: AccessService;
let eventService: EventService;
let environmentService: EnvironmentService;
let featureToggleService: FeatureToggleService;
let user: User; // many methods in this test use User instead of IUser
let auditUser: IAuditUser;
let apiTokenService: ApiTokenService;

let opsUser: IUser;

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
    // @ts-expect-error return type IUser type missing generateImageUrl
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    auditUser = {
        id: user.id,
        username: user.email,
        ip: '127.0.0.1',
    };
    opsUser = await stores.userStore.insert({
        name: 'Test user',
        email: 'test@example.com',
    });
    await stores.accessStore.addUserToRole(opsUser.id, 1, '');
    const config = createTestConfig({
        getLogger,
        experimental: {},
    });
    eventService = createEventsService(db.rawDatabase, config);
    accessService = createAccessService(db.rawDatabase, config);

    featureToggleService = createFeatureToggleService(db.rawDatabase, config);

    environmentService = new EnvironmentService(stores, config, eventService);
    projectService = createProjectService(db.rawDatabase, config);
    apiTokenService = createApiTokenService(db.rawDatabase, config);
    // await stores.environmentStore.updateProperty(DEFAULT_ENV, 'enabled', false);
    // await stores.environmentStore.updateProperty(
    //     'production',
    //     'enabled',
    //     false,
    // );
});
beforeEach(async () => {
    const envs = await stores.environmentStore.getAll();
    const deleteEnvs = envs.map(async (env) => {
        await stores.environmentStore.delete(env.name);
    });
    await Promise.allSettled(deleteEnvs);

    const users = await stores.userStore.getAll();
    const wipeUserPermissions = users.map(async (u) => {
        await stores.accessStore.unlinkUserRoles(u.id);
    });
    await stores.eventStore.deleteAll();
    await Promise.allSettled(wipeUserPermissions);
    await stores.accessStore.addUserToRole(opsUser.id, 1, '');
});

afterAll(async () => {
    await db.destroy();
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

    await projectService.createProject(project, user, auditUser);
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

    await projectService.createProject(project, user, auditUser);
    const ret = await projectService.getProject('test');
    expect(project.id).toEqual(ret.id);
    expect(project.name).toEqual(ret.name);
    expect(project.description).toEqual(ret.description);
    expect(ret.createdAt).toBeTruthy();

    const projectsById = await projectService.getProjects({ id: 'test' });
    const projectsByIds = await projectService.getProjects({ ids: ['test'] });
    expect(projectsById).toMatchObject([{ id: 'test' }]);
    expect(projectsByIds).toMatchObject([{ id: 'test' }]);
});

test('should create new private project', async () => {
    const project = {
        id: 'testPrivate',
        name: 'New private project',
        description: 'Blah',
        defaultStickiness: 'default',
    };

    await projectService.createProject(project, user, auditUser);
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

    await projectService.createProject(project, user, auditUser);
    await projectService.deleteProject(project.id, user, auditUser);

    try {
        await projectService.getProject(project.id);
    } catch (err) {
        expect(err.message).toBe('No project found');
    }
});

test('should not be able to delete project with flags', async () => {
    const project = {
        id: 'test-delete-with-flags',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project, user, auditUser);
    await stores.featureToggleStore.create(project.id, {
        name: 'test-project-delete',
        createdByUserId: 9999,
    });

    try {
        await projectService.deleteProject(project.id, user, auditUser);
    } catch (err) {
        expect(err.message).toBe(
            'You can not delete a project with active feature flags',
        );
    }
});

test('should not delete "default" project', async () => {
    try {
        await projectService.deleteProject('default', user, auditUser);
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
        await projectService.createProject(project, user, auditUser);
        await projectService.createProject(project, user, auditUser);
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

    await projectService.createProject(project, user, TEST_AUDIT_USER);
    await projectService.updateProject(updatedProject, TEST_AUDIT_USER);

    const readProject = await projectService.getProject(project.id);

    expect(updatedProject.name).toBe(readProject.name);
    expect(updatedProject.description).toBe(readProject.description);
    expect(updatedProject.mode).toBe('protected');
    expect(updatedProject.defaultStickiness).toBe('userId');
});

test('should archive project', async () => {
    const project = {
        id: 'test-archive',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'default',
    };

    await projectService.createProject(project, user, TEST_AUDIT_USER);
    await projectService.archiveProject(project.id, TEST_AUDIT_USER);

    const events = await stores.eventStore.getEvents();

    expect(events[0]).toMatchObject({
        type: 'project-archived',
        createdBy: TEST_AUDIT_USER.username,
    });

    const projects = await projectService.getProjects();
    expect(projects.find((p) => p.id === project.id)).toBeUndefined();
    expect(projects.length).not.toBe(0);

    const archivedProjects = await projectService.getProjects({
        archived: true,
    });
    expect(archivedProjects).toMatchObject([
        { id: 'test-archive', archivedAt: expect.any(Date) },
    ]);

    const archivedProject = await projectService.getProject(project.id);
    expect(archivedProject).toMatchObject({ archivedAt: expect.any(Date) });
});

test('archive project removes it from user projects', async () => {
    const project = {
        id: 'test-user-archive',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'default',
    };
    await projectService.createProject(project, user, TEST_AUDIT_USER);

    const userProjectsBeforeArchive = await projectService.getProjectsByUser(
        user.id,
    );
    expect(userProjectsBeforeArchive).toEqual(['test-user-archive']);

    await projectService.archiveProject(project.id, TEST_AUDIT_USER);

    const userProjects = await projectService.getProjectsByUser(user.id);
    expect(userProjects).toEqual([]);
});

test('should revive project', async () => {
    const project = {
        id: 'test-revive',
        name: 'New project',
        mode: 'open' as const,
    };

    await projectService.createProject(project, user, TEST_AUDIT_USER);
    await projectService.archiveProject(project.id, TEST_AUDIT_USER);
    await projectService.reviveProject(project.id, TEST_AUDIT_USER);

    const events = await stores.eventStore.getEvents();

    expect(events[0]).toMatchObject({
        type: 'project-revived',
        createdBy: TEST_AUDIT_USER.username,
    });

    const projects = await projectService.getProjects();
    expect(projects.find((p) => p.id === project.id)).toMatchObject(project);
});

test('should not be able to archive project with flags', async () => {
    const project = {
        id: 'test-archive-with-flags',
        name: 'New project',
        mode: 'open' as const,
    };
    await projectService.createProject(project, user, auditUser);
    await stores.featureToggleStore.create(project.id, {
        name: 'test-project-archive',
        createdByUserId: 9999,
    });

    try {
        await projectService.archiveProject(project.id, auditUser);
    } catch (err) {
        expect(err.message).toBe(
            'You can not archive a project with active feature flags',
        );
    }
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

    await projectService.createProject(project, user, {
        id: user.id,
        username: user.email,
        ip: '127.0.0.1',
    });
    await db
        .rawDatabase('project_settings')
        .del()
        .where({ project: project.id });
    await projectService.updateProject(updatedProject, auditUser);

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
    await projectService.createProject(project, user, auditUser);
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
    await projectService.createProject(project, user, auditUser);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'member1@getunleash.io',
    });
    const projectMember2 = await stores.userStore.insert({
        name: 'Some Member 2',
        email: 'member2@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addAccess(
        project.id,
        [memberRole.id],
        [], // no groups
        [projectMember1.id, projectMember2.id],
        auditUser,
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
        await projectService.createProject(project, user, auditUser);
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

        await expect(
            projectService.addAccess(
                project.id,
                [customRole.id, ownerRole.id],
                [],
                [projectUserAdmin.id],
                auditUser,
            ),
        ).resolves.not.toThrow();
    });

    test('Admin group members should be allowed to add any project role', async () => {
        const viewerUser = await stores.userStore.insert({
            name: 'Some project admin',
            email: 'some_project_admin@example.com',
        });
        await accessService.setUserRootRole(viewerUser.id, RoleName.VIEWER);

        const adminRole = await stores.roleStore.getRoleByName(RoleName.ADMIN);
        const adminGroup = await stores.groupStore.create({
            name: 'admin_group',
            rootRole: adminRole.id,
        });
        await stores.groupStore.addUsersToGroup(
            adminGroup.id,
            [{ user: { id: viewerUser.id } }],
            opsUser.username!,
        );

        const project = {
            id: 'some-project',
            name: 'sp',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user, auditUser);
        const customRole = await stores.roleStore.create({
            name: 'my_custom_project_role_admin_user',
            roleType: 'custom',
            description:
                'Used to prove that you can assign a role when you are admin',
        });

        await expect(
            projectService.addAccess(
                project.id,
                [customRole.id], // roles
                [], // groups
                [opsUser.id], // users
                extractAuditInfoFromUser(viewerUser),
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
        await projectService.createProject(project, user, auditUser);
        const projectAdmin = await stores.userStore.insert({
            name: 'Some project admin',
            email: 'some_other_project_admin@example.com',
        });
        const projectCustomer = await stores.userStore.insert({
            name: 'Some project customer',
            email: 'some_project_customer@example.com',
        });
        const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);
        await accessService.addUserToRole(
            projectAdmin.id,
            ownerRole.id,
            project.id,
        );
        const customRole = await stores.roleStore.create({
            name: 'my_custom_project_role',
            roleType: 'custom',
            description:
                'Used to prove that you can assign a role the project owner does not have',
        });
        await expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [],
                [projectCustomer.id],
                auditUser,
            ),
        ).resolves.not.toThrow();
    });
    test('Users with project role should only be allowed to grant same role to others', async () => {
        const project = {
            id: 'project_role',
            name: 'custom_role',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user, auditUser);
        const projectUser = await stores.userStore.insert({
            name: 'Some project user',
            email: 'user@example.com',
        });
        const projectAuditUser = extractAuditInfoFromUser(projectUser);
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
        await expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [],
                [secondUser.id],
                projectAuditUser,
            ),
        ).resolves.not.toThrow();
        await expect(async () =>
            projectService.addAccess(
                project.id,
                [ownerRole.id],
                [],
                [secondUser.id],
                projectAuditUser,
            ),
        ).rejects.errorWithMessage(
            new InvalidOperationError(
                'User tried to grant role they did not have access to',
            ),
        );
    });
    test('Users that are members of a group with project role should only be allowed to grant same role to others', async () => {
        const project = {
            id: 'project_group_role',
            name: 'custom_role',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user, auditUser);
        const projectUser = await stores.userStore.insert({
            name: 'Some project user',
            email: 'user_with_group_membership@example.com',
        });
        const projectAuditUser = extractAuditInfoFromUser(projectUser);
        const group = await stores.groupStore.create({
            name: 'custom_group_for_role_access',
        });
        await stores.groupStore.addUsersToGroup(
            group.id,
            [{ user: { id: projectUser.id } }],
            opsUser.username!,
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
            opsUser.username!,
            project.id,
        );
        const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);
        const otherGroup = await stores.groupStore.create({
            name: 'custom_group_to_receive_new_access',
        });
        await expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [],
                [secondUser.id],
                projectAuditUser,
            ),
        ).resolves.not.toThrow();
        await expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [otherGroup.id],
                [],
                projectAuditUser,
            ),
        ).resolves.not.toThrow();
        await expect(
            projectService.addAccess(
                project.id,
                [ownerRole.id],
                [],
                [secondUser.id],
                projectAuditUser,
            ),
        ).rejects.errorWithMessage(
            new InvalidOperationError(
                'User tried to grant role they did not have access to',
            ),
        );
    });
    test('Users can assign roles they have to a group', async () => {
        const project = {
            id: 'user_assign_to_group',
            name: 'user_assign_to_group',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project, user, auditUser);
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
        await expect(
            projectService.addAccess(
                project.id,
                [customRole.id],
                [secondGroup.id],
                [],
                auditUser,
            ),
        ).resolves.not.toThrow(
            new InvalidOperationError(
                'User tried to assign a role they did not have access to',
            ),
        );
    });

    test('Users can not assign roles where they do not hold the same permissions', async () => {
        const project = {
            id: 'user_fail_assign_to_user',
            name: 'user_fail_assign_to_user',
            description: '',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await db.stores.environmentStore.create({
            name: 'production',
            type: 'production',
            enabled: true,
        });

        const auditUser = extractAuditInfoFromUser(user);
        await projectService.createProject(project, user, auditUser);
        const projectUser = await stores.userStore.insert({
            name: 'Some project user',
            email: 'fail_assign_role_to_user@example.com',
        });
        const secondUser = await stores.userStore.insert({
            name: 'Some other user',
            email: 'otheruser_no_roles@example.com',
        });

        const customRoleUserAccess = await accessService.createRole(
            {
                name: 'Project-permissions-lead',
                description: 'Role',
                permissions: [
                    {
                        name: 'PROJECT_USER_ACCESS_WRITE',
                    },
                ],
                createdByUserId: SYSTEM_USER_ID,
            },
            SYSTEM_USER_AUDIT,
        );

        const customRoleUpdateEnvironments = await accessService.createRole(
            {
                name: 'Project Lead',
                description: 'Role',
                permissions: [
                    {
                        name: 'UPDATE_FEATURE_ENVIRONMENT',
                        environment: 'production',
                    },
                    {
                        name: 'CREATE_FEATURE_STRATEGY',
                        environment: 'production',
                    },
                ],
                createdByUserId: SYSTEM_USER_ID,
            },
            SYSTEM_USER_AUDIT,
        );

        await projectService.setRolesForUser(
            project.id,
            projectUser.id,
            [customRoleUserAccess.id],
            auditUser,
        );

        const auditProjectUser = extractAuditInfoFromUser(projectUser);

        await expect(
            projectService.setRolesForUser(
                project.id,
                secondUser.id,
                [customRoleUpdateEnvironments.id],
                auditProjectUser,
            ),
        ).rejects.errorWithMessage(
            new InvalidOperationError(
                'User tried to assign a role they did not have access to',
            ),
        );

        const group = await stores.groupStore.create({
            name: 'Some group_awaiting_role',
        });

        await expect(
            projectService.setRolesForGroup(
                project.id,
                group.id,
                [customRoleUpdateEnvironments.id],
                auditProjectUser,
            ),
        ).rejects.errorWithMessage(
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
    await projectService.createProject(project, user, auditUser);

    const projectAdmin1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'admin1@getunleash.io',
    });
    const projectAdmin2 = await stores.userStore.insert({
        name: 'Some Member 2',
        email: 'admin2@getunleash.io',
    });

    const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);

    await projectService.addAccess(
        project.id,
        [ownerRole.id],
        [], // no groups
        [projectAdmin1.id, projectAdmin2.id],
        auditUser,
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

test('add user do nothing if user already has access', async () => {
    const project = {
        id: 'add-users-twice',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project, user, auditUser);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'member42@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addAccess(
        project.id,
        [memberRole.id],
        [], // no groups
        [projectMember1.id],
        auditUser,
    );
    const access = await projectService.getAccessToProject(project.id);
    expect(access.users).toHaveLength(2);

    await projectService.addAccess(
        project.id,
        [memberRole.id],
        [], // no groups
        [projectMember1.id],
        auditUser,
    );
    const accessAfter = await projectService.getAccessToProject(project.id);
    expect(accessAfter.users).toHaveLength(2);
});

test('should remove user from the project', async () => {
    const project = {
        id: 'remove-users',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project, user, auditUser);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'member99@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addAccess(
        project.id,
        [memberRole.id],
        [], // no groups
        [projectMember1.id],
        auditUser,
    );
    await projectService.removeUser(
        project.id,
        memberRole.id,
        projectMember1.id,
        auditUser,
    );

    const { users } = await projectService.getAccessToProject(project.id);
    const memberUsers = users.filter((u) => u.roleId === memberRole.id);

    expect(memberUsers).toHaveLength(0);
});

test('should not change project if feature flag project does not match current project id', async () => {
    const project = {
        id: 'test-change-project',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    const flag = { name: 'test-flag' };

    await projectService.createProject(project, user, auditUser);
    await featureToggleService.createFeatureToggle(project.id, flag, auditUser);

    try {
        await projectService.changeProject(
            'newProject',
            flag.name,
            user,
            'wrong-project-id',
            auditUser,
        );
    } catch (err) {
        expect(err.message.toLowerCase().includes('permission')).toBeTruthy();
        expect(err.message.includes(MOVE_FEATURE_TOGGLE)).toBeTruthy();
    }
});

test('should return 404 if no active project is found with the project id', async () => {
    const project = {
        id: 'test-change-project-2',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    const flag = { name: 'test-flag-2' };

    await projectService.createProject(project, user, auditUser);
    await featureToggleService.createFeatureToggle(project.id, flag, auditUser);

    try {
        await projectService.changeProject(
            'newProject',
            flag.name,
            user,
            project.id,
            auditUser,
        );
    } catch (err) {
        expect(err.message).toBe(
            `Active project with id newProject does not exist`,
        );
    }

    const newProject = {
        id: 'newProject',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(newProject, user, auditUser);
    await projectService.archiveProject(newProject.id, TEST_AUDIT_USER);
    try {
        await projectService.changeProject(
            'newProject',
            flag.name,
            user,
            project.id,
            auditUser,
        );
    } catch (err) {
        expect(err.message).toBe(
            `Active project with id newProject does not exist`,
        );
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

    const flag = { name: 'test-flag-3' };
    const projectAdmin1 = await stores.userStore.insert({
        name: 'test-change-project-creator',
        email: 'admin-change-project@getunleash.io',
    });

    await projectService.createProject(project, user, auditUser);
    await projectService.createProject(
        projectDestination,
        projectAdmin1,
        auditUser,
    );
    await featureToggleService.createFeatureToggle(project.id, flag, auditUser);

    try {
        await projectService.changeProject(
            projectDestination.id,
            flag.name,
            user,
            project.id,
            auditUser,
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
    const flag = { name: randomId() };

    await projectService.createProject(projectA, user, auditUser);
    await projectService.createProject(projectB, user, auditUser);
    await featureToggleService.createFeatureToggle(
        projectA.id,
        flag,
        auditUser,
    );
    await projectService.changeProject(
        projectB.id,
        flag.name,
        user,
        projectA.id,
        auditUser,
    );

    const updatedFeature = await featureToggleService.getFeature({
        featureName: flag.name,
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
    const flag = { name: randomId() };
    await projectService.createProject(projectA, user, auditUser);
    await projectService.createProject(projectB, user, auditUser);
    await featureToggleService.createFeatureToggle(
        projectA.id,
        flag,
        auditUser,
    );
    const eventsBeforeChange = await stores.eventStore.getEvents();
    await projectService.changeProject(
        projectB.id,
        flag.name,
        user,
        projectA.id,
        auditUser,
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
    const flag = { name: randomId() };

    await projectService.createProject(projectA, user, auditUser);
    await projectService.createProject(projectB, user, auditUser);
    await featureToggleService.createFeatureToggle(
        projectA.id,
        flag,
        auditUser,
    );
    await stores.environmentStore.create(environment);
    await environmentService.addEnvironmentToProject(
        environment.name,
        projectB.id,
        auditUser,
    );

    await expect(() =>
        projectService.changeProject(
            projectB.id,
            flag.name,
            user,
            projectA.id,
            auditUser,
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

    await projectService.createProject(project, user, auditUser);
    const connectedEnvs =
        await db.stores.projectStore.getEnvironmentsForProject(project.id);
    expect(connectedEnvs).toHaveLength(1); // connection_test
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

    await projectService.createProject(project, user, auditUser);
    const connectedEnvs =
        await db.stores.projectStore.getEnvironmentsForProject(project.id);

    expect(connectedEnvs.map((e) => e.environment)).toEqual([
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
    await projectService.createProject(project, user, auditUser);

    const projectMember1 = await stores.userStore.insert({
        name: 'Custom',
        email: 'custom@getunleash.io',
    });

    const customRole = await accessService.createRole(
        {
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
        },
        SYSTEM_USER_AUDIT,
    );

    await projectService.addAccess(
        project.id,
        [customRole.id],
        [], // no groups
        [projectMember1.id],
        auditUser,
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

    await projectService.createProject(project, user, auditUser);

    const user1 = await stores.userStore.insert({
        name: 'Projectuser1',
        email: 'project1@getunleash.io',
    });

    const user2 = await stores.userStore.insert({
        name: 'Projectuser2',
        email: 'project2@getunleash.io',
    });

    const customRole = await accessService.createRole(
        {
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
        },
        SYSTEM_USER_AUDIT,
    );

    await projectService.addAccess(
        project.id,
        [customRole.id],
        [], // no groups
        [user1.id, user2.id],
        auditUser,
    );

    let usersForRole = await accessService.getUsersForRole(customRole.id);
    expect(usersForRole.length).toBe(2);

    await projectService.deleteProject(project.id, user, auditUser);
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

    await projectService.createProject(project, user, auditUser);

    const projectUser = await stores.userStore.insert({
        name: 'Projectuser3',
        email: 'project3@getunleash.io',
    });

    const customRole = await accessService.createRole(
        {
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
        },
        SYSTEM_USER_AUDIT,
    );
    const member = await stores.roleStore.getRoleByName(RoleName.MEMBER);

    await projectService.addAccess(
        project.id,
        [member.id],
        [], // no groups
        [projectUser.id],
        auditUser,
    );
    const { users } = await projectService.getAccessToProject(project.id);
    const memberUser = users.filter((u) => u.roleId === member.id);

    expect(memberUser).toHaveLength(1);
    expect(memberUser[0].id).toBe(projectUser.id);
    expect(memberUser[0].name).toBe(projectUser.name);
    await projectService.removeUser(
        project.id,
        member.id,
        projectUser.id,
        auditUser,
    );
    await projectService.addAccess(
        project.id,
        [customRole.id],
        [], // no groups
        [projectUser.id],
        auditUser,
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
    await projectService.createProject(project, user, auditUser);

    const projectMember1 = await stores.userStore.insert({
        name: 'Some Member',
        email: 'update99@getunleash.io',
    });

    const memberRole = await stores.roleStore.getRoleByName(RoleName.MEMBER);
    const ownerRole = await stores.roleStore.getRoleByName(RoleName.OWNER);

    await projectService.addAccess(
        project.id,
        [memberRole.id],
        [], // no groups
        [projectMember1.id],
        auditUser,
    );
    await projectService.changeRole(
        project.id,
        ownerRole.id,
        projectMember1.id,
        auditUser,
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
    await projectService.createProject(project, user, auditUser);

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

    await projectService.addAccess(
        project.id,
        [memberRole.id],
        [], // no groups
        [projectMember1.id],
        auditUser,
    );
    await projectService.changeRole(
        project.id,
        testRole.id,
        projectMember1.id,
        auditUser,
    );

    const { users } = await projectService.getAccessToProject(project.id);
    const memberUsers = users.filter((u) => u.roleId === memberRole.id);
    const testUsers = users.filter((u) => u.roleId === testRole.id);

    expect(memberUsers).toHaveLength(0);
    expect(testUsers).toHaveLength(1);
});

test('Should allow bulk update of group permissions', async () => {
    const project = {
        id: 'bulk-update-project',
        name: 'bulk-update-project',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    await projectService.createProject(project, user, auditUser);
    const groupStore = stores.groupStore;

    const user1 = await stores.userStore.insert({
        name: 'Vanessa Viewer',
        email: 'vanv@getunleash.io',
    });

    const group1 = await groupStore.create({
        name: 'ViewersOnly',
        description: '',
    });

    const createFeatureRole = await accessService.createRole(
        {
            name: 'CreateRole',
            description: '',
            permissions: [
                {
                    id: 2, // CREATE_FEATURE
                },
            ],
            createdByUserId: SYSTEM_USER_ID,
        },
        SYSTEM_USER_AUDIT,
    );
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
        auditUser,
    );
});

test('Should bulk update of only users', async () => {
    const project = 'bulk-update-project-users';

    const user1 = await stores.userStore.insert({
        name: 'Van Viewer',
        email: 'vv@getunleash.io',
    });

    const createFeatureRole = await accessService.createRole(
        {
            name: 'CreateRoleForUsers',
            description: '',
            permissions: [
                {
                    id: 2, // CREATE_FEATURE
                },
            ],
            createdByUserId: SYSTEM_USER_ID,
        },
        SYSTEM_USER_AUDIT,
    );
    const auditUserFromOps = extractAuditInfoFromUser(opsUser);
    await projectService.addAccess(
        project,
        [createFeatureRole.id],
        [],
        [user1.id],
        auditUserFromOps,
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

    await projectService.createProject(project, user, auditUser);

    const group1 = await groupStore.create({
        name: 'ViewersOnly',
        description: '',
    });

    const createFeatureRole = await accessService.createRole(
        {
            name: 'CreateRoleForGroups',
            description: '',
            permissions: [
                {
                    id: 2, // CREATE_FEATURE
                },
            ],
            createdByUserId: SYSTEM_USER_ID,
        },
        SYSTEM_USER_AUDIT,
    );

    await projectService.addAccess(
        project.id,
        [createFeatureRole.id],
        [group1.id],
        [],
        auditUser,
    );
});

test('Should allow permutations of roles, groups and users when adding a new access', async () => {
    const project = {
        id: 'project-access-permutations',
        name: 'project-access-permutations',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user, auditUser);

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

    const role1 = await accessService.createRole(
        {
            name: 'permutation-role-1',
            description: '',
            permissions: [
                {
                    id: 2, // CREATE_FEATURE
                },
            ],
            createdByUserId: SYSTEM_USER_ID,
        },
        SYSTEM_USER_AUDIT,
    );

    const role2 = await accessService.createRole(
        {
            name: 'permutation-role-2',
            description: '',
            permissions: [
                {
                    id: 7, // UPDATE_FEATURE
                },
            ],
            createdByUserId: SYSTEM_USER_ID,
        },
        SYSTEM_USER_AUDIT,
    );

    await projectService.addAccess(
        project.id,
        [role1.id, role2.id],
        [group1.id, group2.id],
        [user1.id, user2.id],
        auditUser,
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

test('should only count active feature flags for project', async () => {
    const project = {
        id: 'only-active',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user, auditUser);

    await stores.featureToggleStore.create(project.id, {
        name: 'only-active-t1',
        createdByUserId: 9999,
    });
    await stores.featureToggleStore.create(project.id, {
        name: 'only-active-t2',
        createdByUserId: 9999,
    });

    await featureToggleService.archiveToggle('only-active-t2', user, auditUser);

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

    await projectService.createProject(project, user, auditUser);

    await stores.featureToggleStore.create(project.id, {
        name: 'archived-flag',
        createdByUserId: 9999,
    });

    await featureToggleService.archiveToggle('archived-flag', user, auditUser);

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
    await stores.environmentStore.create({
        name: 'prod-env',
        type: 'production',
        enabled: true,
    });
    const project = {
        id: 'average-time-to-prod',
        name: 'average-time-to-prod',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };

    await projectService.createProject(project, user, auditUser);

    const flags = [
        { name: 'average-prod-time' },
        { name: 'average-prod-time-2' },
        { name: 'average-prod-time-3' },
        { name: 'average-prod-time-4' },
        { name: 'average-prod-time-5' },
    ];

    const featureFlags = await Promise.all(
        flags.map((flag) => {
            return featureToggleService.createFeatureToggle(
                project.id,
                flag,
                auditUser,
            );
        }),
    );

    await Promise.all(
        featureFlags.map((flag) => {
            return eventService.storeEvent(
                new FeatureEnvironmentEvent({
                    enabled: true,
                    project: project.id,
                    featureName: flag.name,
                    environment: 'prod-env',
                    auditUser,
                }),
            );
        }),
    );

    await updateEventCreatedAt(subDays(new Date(), 31), 'average-prod-time-5');

    await Promise.all(
        featureFlags.map((flag) =>
            updateFeature(flag.name, { created_at: subDays(new Date(), 15) }),
        ),
    );

    await updateFeature('average-prod-time-5', {
        created_at: subDays(new Date(), 33),
    });

    const result = await projectService.getStatusUpdates(project.id);
    expect(result.updates.avgTimeToProdCurrentWindow).toBe(11.4);
});

test('should calculate average time to production ignoring some items', async () => {
    await stores.environmentStore.create({
        name: 'prod-env',
        type: 'production',
        enabled: true,
    });
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
        environment: 'prod-env',
        auditUser,
        tags: [],
    });

    await projectService.createProject(project, user, auditUser);
    await stores.environmentStore.create({
        name: 'customEnv',
        type: 'development',
    });
    await environmentService.addEnvironmentToProject(
        'customEnv',
        project.id,
        SYSTEM_USER_AUDIT,
    );

    // actual flag we take for calculations
    const flag = { name: 'main-flag' };
    await featureToggleService.createFeatureToggle(project.id, flag, auditUser);
    await updateFeature(flag.name, {
        created_at: subDays(new Date(), 20),
    });
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(flag.name)),
    );
    // ignore events added after first enabled
    await updateEventCreatedAt(addDays(new Date(), 1), flag.name);
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(flag.name)),
    );

    // ignore flags enabled in non-prod envs
    const devFlag = { name: 'dev-flag' };
    await featureToggleService.createFeatureToggle(
        project.id,
        devFlag,
        auditUser,
    );
    await eventService.storeEvent(
        new FeatureEnvironmentEvent({
            ...makeEvent(devFlag.name),
            environment: 'customEnv',
        }),
    );

    // ignore flags from other projects
    const otherProjectFlag = { name: 'other-project' };
    await featureToggleService.createFeatureToggle(
        'default',
        otherProjectFlag,
        auditUser,
    );
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(otherProjectFlag.name)),
    );

    // ignore non-release flags
    const nonReleaseFlag = { name: 'permission-flag', type: 'permission' };
    await featureToggleService.createFeatureToggle(
        project.id,
        nonReleaseFlag,
        auditUser,
    );
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(nonReleaseFlag.name)),
    );

    // ignore flags with events before flag creation time
    const previouslyDeleteFlag = { name: 'previously-deleted' };
    await featureToggleService.createFeatureToggle(
        project.id,
        previouslyDeleteFlag,
        auditUser,
    );
    await eventService.storeEvent(
        new FeatureEnvironmentEvent(makeEvent(previouslyDeleteFlag.name)),
    );
    await updateEventCreatedAt(
        subDays(new Date(), 30),
        previouslyDeleteFlag.name,
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

    await projectService.createProject(project, user, auditUser);

    const flags = [
        { name: 'features-created' },
        { name: 'features-created-2' },
        { name: 'features-created-3' },
        { name: 'features-created-4' },
    ];

    await Promise.all(
        flags.map((flag) => {
            return featureToggleService.createFeatureToggle(
                project.id,
                flag,
                auditUser,
            );
        }),
    );

    await Promise.all([
        updateFeature(flags[2].name, { created_at: subDays(new Date(), 31) }),
        updateFeature(flags[3].name, { created_at: subDays(new Date(), 31) }),
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

    await projectService.createProject(project, user, auditUser);

    const flags = [
        { name: 'features-archived' },
        { name: 'features-archived-2' },
        { name: 'features-archived-3' },
        { name: 'features-archived-4' },
    ];

    await Promise.all(
        flags.map((flag) => {
            return featureToggleService.createFeatureToggle(
                project.id,
                flag,
                auditUser,
            );
        }),
    );

    await Promise.all([
        updateFeature(flags[0].name, {
            archived_at: new Date(),
        }),
        updateFeature(flags[1].name, {
            archived_at: new Date(),
        }),
        updateFeature(flags[2].name, {
            archived_at: subDays(new Date(), 31),
        }),
        updateFeature(flags[3].name, {
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

    await projectService.createProject(project, user, auditUser);

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

    await projectService.addAccess(
        project.id,
        [memberRole.id],
        [], // no groups
        createdUsers.map((u) => u.id),
        auditUser,
    );

    const result = await projectService.getStatusUpdates(project.id);
    expect(result.updates.projectMembersAddedCurrentWindow).toBe(6); // 5 members + 1 owner
    expect(result.updates.projectActivityCurrentWindow).toBe(2);
    expect(result.updates.projectActivityPastWindow).toBe(0);
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

        await projectService.createProject(project, user, auditUser);

        await projectService.updateProjectEnterpriseSettings(
            project,
            extractAuditInfoFromUser(user),
        );

        expect(
            (await projectService.getProject(project.id)).featureNaming,
        ).toMatchObject(featureNaming);

        const newPattern = 'new-pattern.+';
        await projectService.updateProjectEnterpriseSettings(
            {
                ...project,
                featureNaming: { pattern: newPattern },
            },
            extractAuditInfoFromUser(user),
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

test('deleting a project with archived flags should result in any remaining archived flags being deleted', async () => {
    const project = {
        id: 'project-with-archived-flags',
        name: 'project-with-archived-flags',
    };
    const flagName = 'archived-and-deleted';

    await projectService.createProject(project, user, auditUser);

    await stores.featureToggleStore.create(project.id, {
        name: flagName,
        createdByUserId: 9999,
    });

    await stores.featureToggleStore.archive(flagName);
    await projectService.deleteProject(project.id, user, auditUser);

    // bring the project back again, previously this would allow those archived flags to be resurrected
    // we now expect them to be deleted correctly
    await projectService.createProject(project, user, auditUser);

    const flags = await stores.featureToggleStore.getAll({
        project: project.id,
        archived: true,
    });

    expect(flags.find((t) => t.name === flagName)).toBeUndefined();
});

test('should also delete api tokens that were only bound to deleted project', async () => {
    await stores.environmentStore.create({
        name: 'prod-env',
        type: 'production',
        enabled: true,
    });
    const project = 'some';
    const tokenName = 'test';

    await projectService.createProject(
        {
            id: project,
            name: 'Test Project 1',
        },
        user,
        auditUser,
    );

    const token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.CLIENT,
        tokenName,
        environment: 'prod-env',
        projects: [project],
    });

    await projectService.deleteProject(project, user, auditUser);
    const deletedToken = await apiTokenService.getToken(token.secret);
    expect(deletedToken).toBeUndefined();
});

test('should not delete project-bound api tokens still bound to project', async () => {
    await stores.environmentStore.create({
        name: 'prod-env',
        type: 'production',
        enabled: true,
    });
    const project1 = 'token-deleted-project';
    const project2 = 'token-not-deleted-project';
    const tokenName = 'test';

    await projectService.createProject(
        {
            id: project1,
            name: 'Test Project 1',
        },
        user,
        auditUser,
    );

    await projectService.createProject(
        {
            id: project2,
            name: 'Test Project 2',
        },
        user,
        auditUser,
    );

    const token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.CLIENT,
        tokenName,
        environment: 'prod-env',
        projects: [project1, project2],
    });

    await projectService.deleteProject(project1, user, auditUser);
    const fetchedToken = await apiTokenService.getToken(token.secret);
    expect(fetchedToken).not.toBeUndefined();
    expect(fetchedToken!.project).toBe(project2);
});

test('should delete project-bound api tokens when all projects they belong to are deleted', async () => {
    await stores.environmentStore.create({
        name: 'prod-env',
        type: 'production',
        enabled: true,
    });
    const project1 = 'token-deleted-project-1';
    const project2 = 'token-deleted-project-2';
    const tokenName = 'test';

    await projectService.createProject(
        {
            id: project1,
            name: 'Test Project 1',
        },
        user,
        auditUser,
    );

    await projectService.createProject(
        {
            id: project2,
            name: 'Test Project 2',
        },
        user,
        auditUser,
    );

    const token = await apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.CLIENT,
        tokenName,
        environment: 'prod-env',
        projects: [project1, project2],
    });

    await projectService.deleteProject(project1, user, auditUser);
    await projectService.deleteProject(project2, user, auditUser);
    const fetchedToken = await apiTokenService.getToken(token.secret);
    expect(fetchedToken).toBeUndefined();
});

test('deleting a project with no archived flags should not result in an error', async () => {
    const project = {
        id: 'project-with-nothing',
        name: 'project-with-nothing',
    };

    await projectService.createProject(project, user, auditUser);
    await projectService.deleteProject(project.id, user, auditUser);
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

    await projectService.createProject(projectOne, user, auditUser);
    await projectService.createProject(projectTwo, user, auditUser);
    await projectService.updateProject({ id, ...rest }, auditUser);
    await projectService.updateProjectEnterpriseSettings(
        { mode, id },
        extractAuditInfoFromUser(user),
    );

    const projects = await projectService.getProjects();
    const foundProjectOne = projects.find(
        (project) => projectOne.id === project.id,
    );
    const foundProjectTwo = projects.find(
        (project) => projectTwo.id === project.id,
    );

    expect(foundProjectOne!.mode).toBe('private');
    expect(foundProjectTwo!.mode).toBe('open');
});

describe('create project with environments', () => {
    const disabledEnv = { name: 'disabled', type: 'production' };

    const extraEnvs = [
        { name: 'development', type: 'development' },
        { name: 'production', type: 'production' },
        { name: 'staging', type: 'staging' },
        { name: 'QA', type: 'QA' },
        disabledEnv,
    ];

    const allEnabledEnvs = ['QA', 'development', 'production', 'staging'];

    beforeEach(async () => {
        await Promise.all(
            extraEnvs.map((env) => stores.environmentStore.create(env)),
        );

        await stores.environmentStore.disable([
            { ...disabledEnv, enabled: true, protected: false, sortOrder: 5 },
        ]);
    });

    afterAll(async () => {
        await Promise.all(
            extraEnvs.map((env) => stores.environmentStore.delete(env.name)),
        );
    });

    const createProjectWithEnvs = async (environments) => {
        const project = await projectService.createProject(
            {
                id: randomId(),
                name: 'New name',
                mode: 'open' as const,
                defaultStickiness: 'default',
                ...(environments ? { environments } : {}),
            },
            user,
            auditUser,
        );

        const projectEnvs = (
            await projectService.getProjectOverview(project.id)
        ).environments.map(({ environment }) => environment);

        projectEnvs.sort();
        return projectEnvs;
    };

    test('no environments specified means all enabled envs are enabled', async () => {
        const created = await createProjectWithEnvs(undefined);

        expect(created).toMatchObject(allEnabledEnvs);
    });

    test('it only enables the envs it is asked to enable', async () => {
        const selectedEnvs = ['development', 'production'];
        const created = await createProjectWithEnvs(selectedEnvs);

        expect(created).toMatchObject(selectedEnvs);
    });

    test('it enables deprecated environments when asked explicitly', async () => {
        const selectedEnvs = ['disabled'];
        const created = await createProjectWithEnvs(selectedEnvs);

        expect(created).toMatchObject(selectedEnvs);
    });

    test("envs that don't exist cause errors", async () => {
        await expect(
            createProjectWithEnvs(['fake-project']),
        ).rejects.toThrowError(BadDataError);
        await expect(
            createProjectWithEnvs(['fake-project']),
        ).rejects.toThrowError(/'fake-project'/);
    });
});

describe('automatic ID generation for create project', () => {
    test('if no ID is included in the creation argument, it gets generated based on the project name', async () => {
        const project = await projectService.createProject(
            {
                name: 'New name',
            },
            user,
            auditUser,
        );

        expect(project.id).toBe('new-name');
    });

    test('projects with the same name get ids with incrementing counters', async () => {
        const createProject = async () =>
            projectService.createProject(
                { name: 'some name' },
                user,
                auditUser,
            );

        const project1 = await createProject();
        const project2 = await createProject();
        const project3 = await createProject();

        expect(project1.id).toBe('some-name');
        expect(project2.id).toBe('some-name-1');
        expect(project3.id).toBe('some-name-2');
    });

    test.each([
        '',
        undefined,
        '     ',
    ])('An id with the value `%s` is treated as missing (and the id is based on the name)', async (id) => {
        const name = randomId();
        const project = await projectService.createProject(
            { name, id },
            user,
            auditUser,
        );

        expect(project.id).toBe(name);
    });

    test('Projects with long names get ids capped at 90 characters and then suffixed', async () => {
        const name = Array.from({ length: 200 })
            .map(() => 'a')
            .join();

        const project = await projectService.createProject(
            {
                name,
            },
            user,
            auditUser,
        );

        expect(project.name).toBe(name);
        expect(project.id.length).toBeLessThanOrEqual(90);

        const secondName =
            name +
            Array.from({ length: 100 })
                .map(() => 'b')
                .join();

        const secondProject = await projectService.createProject(
            {
                name: secondName,
            },
            user,
            auditUser,
        );

        expect(secondProject.name).toBe(secondName);
        expect(secondProject.id).toBe(`${project.id}-1`);
    });

    describe('backwards compatibility', () => {
        const featureFlag = 'createProjectWithEnvironmentConfig';

        test.each([
            true,
            false,
        ])('if the ID is present in the input, it is used as the ID regardless of the feature flag states. Flag state: %s', async (flagState) => {
            const id = randomId();
            // @ts-expect-error - we're just checking that the same
            // thing happens regardless of flag state
            projectService.flagResolver.isEnabled = (flagToCheck: string) => {
                if (flagToCheck === featureFlag) {
                    return flagState;
                } else {
                    return false;
                }
            };
            const project = await projectService.createProject(
                {
                    name: id,
                    id,
                },
                user,
                auditUser,
            );

            expect(project.id).toBe(id);
        });
    });
});
