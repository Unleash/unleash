import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import {
    ApiTokenType,
    IApiToken,
} from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;
let proxyToken: IApiToken;

beforeAll(async () => {
    db = await dbInit('proxy', getLogger);
    app = await setupAppWithAuth(db.stores);
    proxyToken = await app.services.apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.PROXY,
        projects: ['default'],
        environment: 'default',
        username: 'proxy-token-1',
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
    await db.stores.segmentStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
});

test('proxy', async () => {
    return app.request
        .get('/api/frontend')
        .set('Authorization', proxyToken.secret)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.status).toEqual(200);
            expect(res.body).toEqual({ toggles: [] });
        });
});
