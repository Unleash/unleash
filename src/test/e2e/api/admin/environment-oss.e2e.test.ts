import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('environment_api_is_oss_serial', getLogger, {
        isOss: true,
    });
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
            isOss: true,
        },
        db.rawDatabase,
    );
    await db.stores.environmentStore.create({
        name: 'customenvironment',
        type: 'production',
        enabled: true,
    });
    await db.stores.environmentStore.create({
        name: 'customenvironment2',
        type: 'production',
        enabled: true,
    });
    await db.stores.environmentStore.create({
        name: 'customenvironment3',
        type: 'production',
        enabled: true,
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('querying environments in OSS only returns environments that are included in oss', async () => {
    await app.request
        .get('/api/admin/environments')
        .expect(200)
        .expect((res) => {
            expect(res.body.environments).toHaveLength(3);
            const names = res.body.environments.map((env) => env.name);
            expect(names).toEqual(['default', 'development', 'production']);
        });
});
