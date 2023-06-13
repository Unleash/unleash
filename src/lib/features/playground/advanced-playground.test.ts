import {
    IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('advanced_playground', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    advancedPlayground: true,
                },
            },
        },
        db.rawDatabase,
    );
});

beforeEach(async () => {});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('advanced playground evaluation', async () => {
    const { body: result } = await app.request
        .post('/api/admin/playground/advanced')
        .set('Content-Type', 'application/json')
        .expect(200);
    console.log(JSON.stringify(result, null, 2));
});
