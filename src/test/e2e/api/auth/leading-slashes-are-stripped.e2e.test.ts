import getLogger from '../../../fixtures/no-logger';
import dbInit, { ITestDb } from '../../helpers/database-init';
import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import { IAuthType, IUnleashStores } from '../../../../lib/types';
import { ApiTokenType } from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let appWithBaseUrl: IUnleashTest;
let stores: IUnleashStores;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit(
        'multiple_leading_slashes_are_still_authed_serial',
        getLogger,
    );
    stores = db.stores;
    app = await setupAppWithAuth(stores, {
        authentication: { enableApiToken: true, type: IAuthType.DEMO },
    });
    appWithBaseUrl = await setupAppWithAuth(stores, {
        server: { unleashUrl: 'http://localhost:4242', basePathUri: '/demo' },
        authentication: { enableApiToken: true, type: IAuthType.DEMO },
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Access to//api/admin/tags are refused no matter how many leading slashes', async () => {
    await app.request.get('//api/admin/tags').expect(401);
    await app.request.get('////api/admin/tags').expect(401);
});

test('Access to /api/client/features are refused no matter how many leading slashes', async () => {
    await app.request.get('/api/client/features').expect(401);
    await app.request.get('/////api/client/features').expect(401);
    await app.request.get('//api/client/features').expect(401);
});

test('multiple slashes after base path is also rejected with 404', async () => {
    await appWithBaseUrl.request.get('/demo///api/client/features').expect(401);
    await appWithBaseUrl.request.get('/demo//api/client/features').expect(401);
    await appWithBaseUrl.request.get('/demo/api/client/features').expect(401);
});

test(`Access with API token is granted`, async () => {
    let token = await app.services.apiTokenService.createApiTokenWithProjects({
        environment: 'default',
        projects: ['default'],
        tokenName: 'test',
        type: ApiTokenType.CLIENT,
    });
    await app.request
        .get('/api/client/features')
        .set('Authorization', token.secret)
        .expect(200);
});
