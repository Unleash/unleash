import { createTestConfig } from '../../../test/config/test-config.js';
import { ReleasePlanTemplateStore } from './release-plan-template-store.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';

let db: ITestDb;
const config = createTestConfig();

beforeAll(async () => {
    db = await dbInit('release_plan_template_store_serial', config.getLogger);
});

afterAll(async () => {
    await db.destroy();
});

test('new templates are global by default', async () => {
    const store = new ReleasePlanTemplateStore(db.rawDatabase, config);
    const template = await store.insert({
        name: 'test-template',
        description: 'a test template',
        discriminator: 'template',
        createdByUserId: 1,
    });

    expect(template).toMatchObject({
        id: expect.any(String),
        name: 'test-template',
        createdAt: expect.any(Date),
        project: null,
    });
});

test('templates can be scoped to a project', async () => {
    const store = new ReleasePlanTemplateStore(db.rawDatabase, config);

    const projectTemplate = await store.insert({
        name: 'project-scoped-template',
        description: 'scoped to a project',
        discriminator: 'template',
        createdByUserId: 1,
        project: 'default',
    });
    expect(projectTemplate).toMatchObject({ project: 'default' });
    expect(await store.getById(projectTemplate.id)).toMatchObject({
        project: 'default',
    });
});

test('global templates are visible in every project, scoped ones only in their own and listed before global ones', async () => {
    const store = new ReleasePlanTemplateStore(db.rawDatabase, config);
    await db.rawDatabase('release_plan_definitions').del();
    await db.stores.projectStore.create({
        id: 'other-project',
        name: 'other-project',
        description: '',
    });

    await store.insert({
        name: 'global-template',
        discriminator: 'template',
        createdByUserId: 1,
    });
    await store.insert({
        name: 'default-template',
        discriminator: 'template',
        createdByUserId: 1,
        project: 'default',
    });
    await store.insert({
        name: 'other-template',
        discriminator: 'template',
        createdByUserId: 1,
        project: 'other-project',
    });

    const globalTemplates = await store.getGlobalTemplates();
    expect(globalTemplates.map(({ name }) => name)).toEqual([
        'global-template',
    ]);

    const defaultTemplates = await store.getProjectTemplates('default');
    expect(defaultTemplates.map(({ name }) => name)).toEqual([
        'default-template',
    ]);

    const visibleInDefault =
        await store.getProjectAndGlobalTemplates('default');
    expect(visibleInDefault.map(({ name }) => name)).toEqual([
        'default-template',
        'global-template',
    ]);

    const visibleInOther =
        await store.getProjectAndGlobalTemplates('other-project');
    expect(visibleInOther.map(({ name }) => name)).toEqual([
        'other-template',
        'global-template',
    ]);
});

test('updates return exactly the template model fields', async () => {
    const store = new ReleasePlanTemplateStore(db.rawDatabase, config);
    const template = await store.insert({
        name: 'template1',
        description: 'old desc',
        discriminator: 'template',
        createdByUserId: 1,
    });

    const updatedTemplate = await store.update(template.id, {
        description: 'new description',
    });

    expect(Object.keys(updatedTemplate)).toEqual([
        'id',
        'name',
        'createdAt',
        'description',
        'project',
        'discriminator',
        'createdByUserId',
    ]);
});
