import type { IEnvironmentStore } from '../project-environments/environment-store-type.js';

import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { IProjectStore, IUnleashStores } from '../../types/index.js';
import type { IProjectInsert } from './project-store-type.js';

let stores: IUnleashStores;
let db: ITestDb;
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

test('should exclude archived projects', async () => {
    const project = {
        id: 'archive-me',
        name: 'archive-me',
        description: 'Blah',
        mode: 'open' as const,
    };
    await projectStore.create(project);
    await projectStore.archive(project.id);

    const allProjects = await projectStore.getAll();
    const count = await projectStore.count();
    const modeCounts = await projectStore.getProjectModeCounts();

    expect(allProjects).toMatchObject([{ id: 'default' }]);
    expect(count).toBe(1);
    expect(modeCounts).toMatchObject([{ mode: 'open', count: 1 }]);
});

test('should have default project', async () => {
    const project = await projectStore.get('default');
    expect(project).toBeDefined();
    expect(project!.id).toBe('default');
});

test('should create new project', async () => {
    const project = {
        id: 'test',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
    };
    await projectStore.create(project);
    const ret = await projectStore.get('test');
    const exists = await projectStore.exists('test');
    expect(project.id).toEqual(ret!.id);
    expect(project.name).toEqual(ret!.name);
    expect(project.description).toEqual(ret!.description);
    expect(ret!.createdAt).toBeTruthy();
    expect(ret!.updatedAt).toBeTruthy();
    expect(exists).toBe(true);
});

test('should delete project', async () => {
    const project = {
        id: 'test-delete',
        name: 'New project',
        description: 'Blah',
        mode: 'open' as const,
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
        mode: 'open' as const,
    };

    const updatedProject = {
        id: 'test-update',
        name: 'New name',
        description: 'Blah longer desc',
        mode: 'open' as const,
    };

    await projectStore.create(project);
    await projectStore.update(updatedProject);

    const readProject = await projectStore.get(project.id);

    expect(updatedProject.name).toBe(readProject!.name);
    expect(updatedProject.description).toBe(readProject!.description);
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
        {
            description: 'some project desc',
            name: 'some name',
            id: 'someId',
            mode: 'open' as const,
        },
        {
            description: 'another project',
            name: 'another name',
            id: 'anotherId',
            mode: 'open' as const,
        },
    ];

    await projectStore.importProjects(projectsToImport);

    const projects = await projectStore.getAll();

    const someId = projects.find((p) => p.id === 'someId');
    const anotherId = projects.find((p) => p.id === 'anotherId');

    expect(projects.length - projectsCount).toBe(2);
    expect(someId).toBeDefined();
    expect(someId?.name).toBe('some name');
    expect(someId?.description).toBe('some project desc');
    expect(anotherId).toBeDefined();
});

test('should add environment to project', async () => {
    const project = {
        id: 'test-env',
        name: 'New project with env',
        description: 'Blah',
        mode: 'open' as const,
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

test('should update project enterprise settings', async () => {
    const project = {
        id: 'test-enterprise-settings',
        name: 'New project for enterprise settings',
        description: 'Blah',
        mode: 'open' as const,
    };
    await projectStore.create(project);

    await projectStore.updateProjectEnterpriseSettings({
        id: 'test-enterprise-settings',
        mode: 'open' as const,
    });

    let updatedProject = await projectStore.get(project.id);

    expect(updatedProject!.mode).toBe('open');
    expect(updatedProject!.featureNaming).toEqual({
        pattern: null,
        example: null,
        description: null,
    });
    expect(updatedProject!.linkTemplates).toEqual([]);

    await projectStore.updateProjectEnterpriseSettings({
        id: 'test-enterprise-settings',
        mode: 'protected' as const,
        featureNaming: {
            pattern: 'custom-pattern-[A-Z]+',
            example: 'custom-pattern-MYFLAG',
            description: 'Custom description',
        },
        linkTemplates: [
            {
                title: 'My Link',
                urlTemplate: 'https://example.com/{{flag}}',
            },
        ],
    });

    updatedProject = await projectStore.get(project.id);
    expect(updatedProject!.mode).toBe('protected');
    expect(updatedProject!.featureNaming).toEqual(
        expect.objectContaining({
            pattern: 'custom-pattern-[A-Z]+',
            example: 'custom-pattern-MYFLAG',
            description: 'Custom description',
        }),
    );
    expect(updatedProject!.linkTemplates).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                title: 'My Link',
                urlTemplate: 'https://example.com/{{flag}}',
            }),
        ]),
    );

    const linkTemplates = await projectStore.getProjectLinkTemplates(
        project.id,
    );

    expect(linkTemplates).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                title: 'My Link',
                urlTemplate: 'https://example.com/{{flag}}',
            }),
        ]),
    );
});
