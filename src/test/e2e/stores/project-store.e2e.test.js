'use strict';

const test = require('ava');
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let stores;
let projectStore;

test.before(async () => {
    const db = await dbInit('project_store_serial', getLogger);
    stores = db.stores;
    projectStore = stores.projectStore;
});

test.after(async () => {
    await stores.db.destroy();
});

test.serial('should have default project', async t => {
    const project = await projectStore.get('default');
    t.assert(project);
    t.is(project.id, 'default');
});

test.serial('should create new project', async t => {
    const project = {
        id: 'test',
        name: 'New project',
        description: 'Blah',
    };
    await projectStore.create(project);
    const ret = await projectStore.get('test');
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
    await projectStore.create(project);
    await projectStore.delete(project.id);

    try {
        await projectStore.get(project.id);
    } catch (err) {
        t.is(err.message, 'No project found');
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

    await projectStore.create(project);
    await projectStore.update(updatedProject);

    const readProject = await projectStore.get(project.id);

    t.is(updatedProject.name, readProject.name);
    t.is(updatedProject.description, readProject.description);
});

test.serial('should give error when getting unkown project', async t => {
    try {
        await projectStore.get('unknown');
    } catch (err) {
        t.is(err.message, 'No project found');
    }
});
