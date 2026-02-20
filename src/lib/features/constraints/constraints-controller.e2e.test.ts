import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';

let app: IUnleashTest;
let db: ITestDb;

const PATH = '/api/admin/constraints/validate';

beforeAll(async () => {
    db = await dbInit('constraints_controller', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {}, db.rawDatabase);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

describe('ConstraintsController - POST /validate', () => {
    test('returns 204 for a valid constraint', async () => {
        await app.request
            .post(PATH)
            .send({ contextName: 'environment', operator: 'IN', values: ['a'] })
            .expect(204);
    });

    test('returns 400 for an invalid constraint', async () => {
        await app.request
            .post(PATH)
            .send({ contextName: 'environment', operator: 'NUM_EQ', value: 'not-a-number' })
            .expect(400);
    });
});
