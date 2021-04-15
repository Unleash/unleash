const test = require('ava');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');
const ProjectService = require('../../../lib/services/project-service');
const {
    AccessService,
    RoleName,
} = require('../../../lib/services/access-service');
const User = require('../../../lib/user');
const { UPDATE_PROJECT } = require('../../../lib/permissions');
const NotFoundError = require('../../../lib/error/notfound-error');

let stores;
let db;

let projectService;
let accessService;
let user;

test.before(async () => {
    db = await dbInit('project_service_serial', getLogger);
    stores = db.stores;
    user = await stores.userStore.insert(
        new User({ name: 'Some Name', email: 'test@getunleash.io' }),
    );
    const config = { getLogger, experimental: { rbac: true } };
    accessService = new AccessService(stores, config);
    projectService = new ProjectService(stores, config, accessService);
});

test.after(async () => {
    await db.destroy();
});

test.serial('should have default project', async t => {
    const project = await projectService.getProject('default');
    t.assert(project);
    t.is(project.id, 'default');
});

test.serial('should list all projects', async t => {
    const project = {
        id: 'test-list',
        name: 'New project',
        description: 'Blah',
    };

    await projectService.createProject(project, user);
    const projects = await projectService.getProjects();
    t.is(projects.length, 2);
});

test.serial('should create new project', async t => {
    const project = {
        id: 'test',
        name: 'New project',
        description: 'Blah',
    };

    await projectService.createProject(project, user);
    const ret = await projectService.getProject('test');
    t.deepEqual(project.id, ret.id);
    t.deepEqual(project.name, ret.name);
    t.deepEqual(project.description, ret.description);
    t.truthy(ret.createdAt);
});

test.serial('should delete project', async t => {
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
        t.is(err.message, 'No project found');
    }
});

test.serial('should not be able to delete project with toggles', async t => {
    const project = {
        id: 'test-delete-with-toggles',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);
    await stores.featureToggleStore.createFeature({
        name: 'test-project-delete',
        project: project.id,
        enabled: false,
    });

    try {
        await projectService.deleteProject(project.id, user);
    } catch (err) {
        t.is(
            err.message,
            'You can not delete as project with active feature toggles',
        );
    }
});

test.serial('should not delete "default" project', async t => {
    try {
        await projectService.deleteProject('default', user);
    } catch (err) {
        t.is(err.message, 'You can not delete the default project!');
    }
});

test.serial('should validate name, legal', async t => {
    const result = await projectService.validateId('new_name');
    t.true(result);
});

test.serial('should not be able to create exiting project', async t => {
    const project = {
        id: 'test-delete',
        name: 'New project',
        description: 'Blah',
    };
    try {
        await projectService.createProject(project, user);
        await projectService.createProject(project, user);
    } catch (err) {
        t.is(err.message, 'A project with this id already exists.');
    }
});

test.serial('should require URL friendly ID', async t => {
    try {
        await projectService.validateId('new name øæå');
    } catch (err) {
        t.is(err.message, '"value" must be URL friendly');
    }
});

test.serial('should require unique ID', async t => {
    try {
        await projectService.validateId('default');
    } catch (err) {
        t.is(err.message, 'A project with this id already exists.');
    }
});

test.serial('should update project', async t => {
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

    t.is(updatedProject.name, readProject.name);
    t.is(updatedProject.description, readProject.description);
});

test.serial('should give error when getting unknown project', async t => {
    try {
        await projectService.getProject('unknown');
    } catch (err) {
        t.is(err.message, 'No project found');
    }
});

test.serial(
    '(TODO: v4): should create roles for new project if userId is missing',
    async t => {
        const project = {
            id: 'test-roles-no-id',
            name: 'New project',
            description: 'Blah',
        };
        await projectService.createProject(project, {
            username: 'random-user',
        });
        const roles = await stores.accessStore.getRolesForProject(project.id);

        t.is(roles.length, 2);
        t.false(
            await accessService.hasPermission(user, UPDATE_PROJECT, project.id),
        );
    },
);

test.serial('should create roles when project is created', async t => {
    const project = {
        id: 'test-roles',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);
    const roles = await stores.accessStore.getRolesForProject(project.id);
    t.is(roles.length, 2);
    t.true(await accessService.hasPermission(user, UPDATE_PROJECT, project.id));
});

test.serial('should get list of users with access to project', async t => {
    const project = {
        id: 'test-roles-access',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);
    const { roles, users } = await projectService.getUsersWithAccess(
        project.id,
        user,
    );

    const owner = roles.find(role => role.name === RoleName.OWNER);
    const member = roles.find(role => role.name === RoleName.MEMBER);

    t.is(users.length, 1);
    t.is(users[0].id, user.id);
    t.is(users[0].name, user.name);
    t.is(users[0].roleId, owner.id);
    t.truthy(member);
});

test.serial('should add a member user to the project', async t => {
    const project = {
        id: 'add-users',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert(
        new User({ name: 'Some Member', email: 'member1@getunleash.io' }),
    );
    const projectMember2 = await stores.userStore.insert(
        new User({ name: 'Some Member 2', email: 'member2@getunleash.io' }),
    );

    const roles = await stores.accessStore.getRolesForProject(project.id);
    const memberRole = roles.find(r => r.name === RoleName.MEMBER);

    await projectService.addUser(project.id, memberRole.id, projectMember1.id);
    await projectService.addUser(project.id, memberRole.id, projectMember2.id);

    const { users } = await projectService.getUsersWithAccess(project.id, user);
    const memberUsers = users.filter(u => u.roleId === memberRole.id);

    t.is(memberUsers.length, 2);
    t.is(memberUsers[0].id, projectMember1.id);
    t.is(memberUsers[0].name, projectMember1.name);
    t.is(memberUsers[1].id, projectMember2.id);
    t.is(memberUsers[1].name, projectMember2.name);
});

test.serial('should add admin users to the project', async t => {
    const project = {
        id: 'add-admin-users',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectAdmin1 = await stores.userStore.insert(
        new User({ name: 'Some Member', email: 'admin1@getunleash.io' }),
    );
    const projectAdmin2 = await stores.userStore.insert(
        new User({ name: 'Some Member 2', email: 'admin2@getunleash.io' }),
    );

    const projectRoles = await stores.accessStore.getRolesForProject(
        project.id,
    );
    const ownerRole = projectRoles.find(r => r.name === RoleName.OWNER);

    await projectService.addUser(project.id, ownerRole.id, projectAdmin1.id);
    await projectService.addUser(project.id, ownerRole.id, projectAdmin2.id);

    const { users } = await projectService.getUsersWithAccess(project.id, user);

    const adminUsers = users.filter(u => u.roleId === ownerRole.id);

    t.is(adminUsers.length, 3);
    t.is(adminUsers[1].id, projectAdmin1.id);
    t.is(adminUsers[1].name, projectAdmin1.name);
    t.is(adminUsers[2].id, projectAdmin2.id);
    t.is(adminUsers[2].name, projectAdmin2.name);
});

test.serial('add user only accept to add users to project roles', async t => {
    const roles = await accessService.getRoles();
    const memberRole = roles.find(r => r.name === RoleName.MEMBER);

    await t.throwsAsync(
        async () => {
            await projectService.addUser('some-id', memberRole.id, user.id);
        },
        {
            instanceOf: NotFoundError,
            message: /Could not find roleId=\d+ on project=some-id/,
        },
    );
});

test.serial('add user should fail if user already have access', async t => {
    const project = {
        id: 'add-users-twice',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert(
        new User({ name: 'Some Member', email: 'member42@getunleash.io' }),
    );

    const roles = await stores.accessStore.getRolesForProject(project.id);
    const memberRole = roles.find(r => r.name === RoleName.MEMBER);

    await projectService.addUser(project.id, memberRole.id, projectMember1.id);

    await t.throwsAsync(
        async () => {
            await projectService.addUser(
                project.id,
                memberRole.id,
                projectMember1.id,
            );
        },
        {
            instanceOf: Error,
            message: 'User already have access to project=add-users-twice',
        },
    );
});

test.serial('should remove user from the project', async t => {
    const project = {
        id: 'remove-users',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, user);

    const projectMember1 = await stores.userStore.insert(
        new User({ name: 'Some Member', email: 'member99@getunleash.io' }),
    );

    const roles = await stores.accessStore.getRolesForProject(project.id);
    const memberRole = roles.find(r => r.name === RoleName.MEMBER);

    await projectService.addUser(project.id, memberRole.id, projectMember1.id);
    await projectService.removeUser(
        project.id,
        memberRole.id,
        projectMember1.id,
    );

    const { users } = await projectService.getUsersWithAccess(project.id, user);
    const memberUsers = users.filter(u => u.roleId === memberRole.id);

    t.is(memberUsers.length, 0);
});
