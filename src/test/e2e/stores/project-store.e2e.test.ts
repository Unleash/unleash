import { IProjectInsert, IProjectStore } from 'lib/types/stores/project-store';
import { IEnvironmentStore } from 'lib/types/stores/environment-store';

import dbInit from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';

let stores;
let db;
let projectStore: IProjectStore;
let environmentStore: IEnvironmentStore;

beforeAll(async () => {
    db = await dbInit('project_store_serial', getLogger);
    stores = db.stores;
    projectStore = stores.projectStore;
    environmentStore = stores.environmentStore;
});

afterAll(async () => {
    await db.destroy();
});

test('should have default project', async () => {
    const project = await projectStore.get('default');
    expect(project).toBeDefined();
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
    const exists = await projectStore.exists('test');
    expect(project.id).toEqual(ret.id);
    expect(project.name).toEqual(ret.name);
    expect(project.description).toEqual(ret.description);
    expect(ret.createdAt).toBeTruthy();
    expect(ret.updatedAt).toBeTruthy();
    expect(exists).toBe(true);
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

test('should give error when getting unknown project', async () => {
    try {
        await projectStore.get('unknown');
    } catch (err) {
        expect(err.message).toBe('No project found');
    }
});

test('should import projects', async () => {
    const projectsCount = (await projectStore.getAll()).length;

    const projectsToImport: IProjectInsert[] = [
        { description: 'some project desc', name: 'some name', id: 'someId' },
        {
            description: 'another project',
            name: 'another name',
            id: 'anotherId',
        },
    ];

    await projectStore.importProjects(projectsToImport);

    const projects = await projectStore.getAll();

    const someId = projects.find((p) => p.id === 'someId');
    const anotherId = projects.find((p) => p.id === 'anotherId');

    expect(projects.length - projectsCount).toBe(2);
    expect(someId).toBeDefined();
    expect(someId.name).toBe('some name');
    expect(someId.description).toBe('some project desc');
    expect(anotherId).toBeDefined();
});

test('should add environment to project', async () => {
    const project = {
        id: 'test-env',
        name: 'New project with env',
        description: 'Blah',
    };

    await environmentStore.create({
        name: 'test',
        type: 'production',
    });

    await projectStore.create(project);
    await projectStore.addEnvironmentToProject(project.id, 'test');

    const envs = await projectStore.getEnvironmentsForProject(project.id);

    expect(envs).toHaveLength(1);
});
