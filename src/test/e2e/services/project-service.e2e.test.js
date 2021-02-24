const test = require('ava');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');
const ProjectService = require('../../../lib/services/project-service');

let stores;
// let projectStore;
let projectService;

test.before(async () => {
    const db = await dbInit('project_service_serial', getLogger);
    stores = db.stores;
    // projectStore = stores.projectStore;
    projectService = new ProjectService(stores, { getLogger });
});

test.after(async () => {
    await stores.db.destroy();
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
    await projectService.createProject(project, 'someUser');
    const projects = await projectService.getProjects();
    t.is(projects.length, 2);
});

test.serial('should create new project', async t => {
    const project = {
        id: 'test',
        name: 'New project',
        description: 'Blah',
    };
    await projectService.createProject(project, 'someUser');
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
    await projectService.createProject(project, 'some-user');
    await projectService.deleteProject(project.id, 'some-user');

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
    await projectService.createProject(project, 'some-user');
    await stores.featureToggleStore.createFeature({
        name: 'test-project-delete',
        project: project.id,
        enabled: false,
    });

    try {
        await projectService.deleteProject(project.id, 'some-user');
    } catch (err) {
        t.is(
            err.message,
            'You can not delete as project with active feature toggles',
        );
    }
});

test.serial('should not delete "default" project', async t => {
    try {
        await projectService.deleteProject('default', 'some-user');
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
        await projectService.createProject(project, 'some-user');
        await projectService.createProject(project, 'some-user');
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

    await projectService.createProject(project, 'some-user');
    await projectService.updateProject(updatedProject, 'some-user');

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
