'use strict';;
const dbInit = require('../helpers/database-init');
const getLogger = require('../../fixtures/no-logger');

let stores;
let db;
let projectStore;

beforeAll(async () => {
    db = await dbInit('project_store_serial', getLogger);
    stores = db.stores;
    projectStore = stores.projectStore;
});

afterAll(async () => {
    await db.destroy();
});

test('should have default project', async () => {
    const project = await projectStore.get('default');
    t.assert(project);
    expect(project.id).toBe('default');
});

test('should create new project', async () => {
    const project = {
        id: 'test',
        name: 'New project',
        description: 'Blah',
    };
    await projectStore.create(project);
    const ret = await projectStore.get('test');
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
    await projectStore.create(project);
    await projectStore.delete(project.id);

    try {
        await projectStore.get(project.id);
    } catch (err) {
        expect(err.message).toBe('No project found');
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

    await projectStore.create(project);
    await projectStore.update(updatedProject);

    const readProject = await projectStore.get(project.id);

    expect(updatedProject.name).toBe(readProject.name);
    expect(updatedProject.description).toBe(readProject.description);
});

test('should give error when getting unkown project', async () => {
    try {
        await projectStore.get('unknown');
    } catch (err) {
        expect(err.message).toBe('No project found');
    }
});
