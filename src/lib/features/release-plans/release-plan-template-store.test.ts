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

test('insert returns createdAt from the database', async () => {
    const store = new ReleasePlanTemplateStore(db.rawDatabase, config);
    const template = await store.insert({
        name: 'test-template',
        description: 'a test template',
        discriminator: 'template',
        createdByUserId: 1,
    });

    expect(template.id).toBeDefined();
    expect(template.createdAt).toBeDefined();
    expect(template.createdAt).toBeInstanceOf(Date);
    expect(template.name).toBe('test-template');
});

test("store updates don't leak column names that don't belong in the model", async () => {
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

    // camelCased version of db column names that don't belong in the return type
    const unmappedColumns = [
        'featureName',
        'environment',
        'activeMilestoneId',
        'releasePlanTemplateId',
    ];
    for (const column of unmappedColumns) {
        expect(updatedTemplate).not.toHaveProperty(column);
    }
});
