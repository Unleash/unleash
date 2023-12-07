import dbInit, { ITestDb } from '../../../../test/e2e/helpers/database-init';
import {
    IUnleashTest,
    setupAppWithAuth,
} from '../../../../test/e2e/helpers/test-helper';
import getLogger from '../../../../test/fixtures/no-logger';
import { IApiToken, ApiTokenType } from '../../../types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;
let clientToken: IApiToken;

beforeAll(async () => {
    db = await dbInit('client_api_auth', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            frontendApiOrigins: ['https://example.com'],
        },
        db.rawDatabase,
    );

    clientToken = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.CLIENT,
            projects: ['*'],
            environment: 'default',
            tokenName: `client-api-auth`,
        },
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should fail requests without auth headers', async () => {
    await app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(401);
});

test('should allow requests to /api/client/features with authorization header', async () => {
    await app.request
        .get('/api/client/features')
        .set('authorization', clientToken.secret)
        .expect('Content-Type', /json/)
        .expect(200);
});

test('should allow requests to /api/client/features with x-unleash-auth header', async () => {
    await app.request
        .get('/api/client/features')
        .set('x-unleash-auth', clientToken.secret)
        .expect('Content-Type', /json/)
        .expect(200);
});
