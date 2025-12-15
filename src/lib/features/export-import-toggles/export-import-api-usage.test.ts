import { setupAppWithCustomAuth } from '../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { DEFAULT_PROJECT } from '../../types/index.js';
import { DEFAULT_ENV } from '../../util/index.js';
import type { ImportTogglesSchema } from '../../openapi/index.js';
import { ApiTokenType } from '../../types/model.js';
import { ApiUser } from '../../types/index.js';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('export_import_api_admin', getLogger);
});

afterAll(async () => {
    await db.destroy();
});

const defaultImportPayload: ImportTogglesSchema = {
    data: {
        features: [
            {
                project: 'old_project',
                name: 'first_feature',
            },
        ],
        featureStrategies: [],
        featureEnvironments: [],
        featureTags: [],
        tagTypes: [],
        contextFields: [],
        segments: [],
    },
    project: DEFAULT_PROJECT,
    environment: DEFAULT_ENV,
};

test('reject API imports with admin tokens', async () => {
    const preHook = (app: any) => {
        app.use('/api/admin/', async (req, _res, next) => {
            const user = new ApiUser({
                permissions: ['ADMIN'],
                environment: '*',
                type: ApiTokenType.ADMIN,
                tokenName: 'tokenName',
                secret: 'secret',
                projects: ['*'],
            });
            req.user = user;
            next();
        });
    };

    const { request, destroy } = await setupAppWithCustomAuth(
        db.stores,
        preHook,
    );

    const { body } = await request
        .post('/api/admin/features-batch/import')
        .send(defaultImportPayload)
        .expect(400);

    expect(body).toMatchObject({
        message:
            // it tells the user that they used an admin token
            expect.stringContaining('admin') &&
            // it tells the user to use a personal access token
            expect.stringContaining('personal access token') &&
            // it tells the user to use a service account
            expect.stringContaining('service account'),
    });

    await destroy();
});
