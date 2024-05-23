import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { DEFAULT_ENV } from '../../../../lib/util/constants';
import type User from '../../../../lib/types/user';
import { ApiTokenType } from '../../../../lib/types/models/api-token';
import { TEST_AUDIT_USER } from '../../../../lib/types';

let app: IUnleashTest;
let db: ITestDb;
const testUser = { name: 'test', id: -9999 } as User;
let clientSecret: string;
let frontendSecret: string;

beforeAll(async () => {
    db = await dbInit('feature_api_client_auth_none', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        {
            authentication: {
                type: 'none',
            },
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'feature_1',
            description: 'the #1 feature',
            impressionData: true,
        },
        TEST_AUDIT_USER,
    );
    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'feature_2',
            description: 'soon to be the #1 feature',
        },
        TEST_AUDIT_USER,
    );

    await app.services.featureToggleService.createFeatureToggle(
        'default',
        {
            name: 'feature_3',
            description: 'terrible feature',
        },
        TEST_AUDIT_USER,
    );

    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            tokenName: 'test',
            type: ApiTokenType.CLIENT,
            environment: DEFAULT_ENV,
            projects: ['default'],
        },
    );
    clientSecret = token.secret;

    const frontendToken =
        await app.services.apiTokenService.createApiTokenWithProjects({
            tokenName: 'test',
            type: ApiTokenType.FRONTEND,
            environment: DEFAULT_ENV,
            projects: ['default'],
        });
    frontendSecret = frontendToken.secret;
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns three feature flags', async () => {
    return app.request
        .get('/api/client/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.features).toHaveLength(3);
        });
});

test('returns 401 for incorrect api token', async () => {
    return app.request
        .get('/api/client/features')
        .set('Authorization', 'some-invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);
});

test('returns success for correct api token', async () => {
    return app.request
        .get('/api/client/features')
        .set('Authorization', clientSecret)
        .expect('Content-Type', /json/)
        .expect(200);
});

test('returns successful for frontend API without token', async () => {
    return app.request
        .get('/api/frontend')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('returns 401 for frontend API with invalid token', async () => {
    return app.request
        .get('/api/frontend')
        .expect('Content-Type', /json/)
        .set('Authorization', 'some-invalid-token')
        .expect(401);
});

test('returns 200 for frontend API with valid token', async () => {
    return app.request
        .get('/api/frontend')
        .expect('Content-Type', /json/)
        .set('Authorization', frontendSecret)
        .expect(200);
});
