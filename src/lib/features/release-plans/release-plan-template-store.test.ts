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
