import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { ApiTokenType } from '../../types/model.js';
import { DEFAULT_ENV } from '../../util/constants.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('dynamic_configuration_api_poc', getLogger);
    app = await setupAppWithAuth(db.stores, {}, db.rawDatabase);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns the domain representation from the project API', async () => {
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.ADMIN,
            tokenName: 'dynamic-configuration-admin',
            environment: '*',
            projects: ['*'],
        },
    );

    const response = await app.request
        .get('/api/admin/projects/default/configurations')
        .set('Authorization', token.secret)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body.configurations[0]).toMatchObject({
        key: 'api_timeout_ms',
        project: 'default',
        type: 'number',
        validation: {
            minimum: 100,
            maximum: 10_000,
        },
        versions: [
            {
                version: 1,
                value: 5000,
            },
            {
                version: 2,
                value: 2000,
            },
            {
                version: 3,
                value: 4000,
            },
            {
                version: 4,
                value: 3000,
            },
        ],
        environments: {
            development: {
                defaultVersion: 1,
            },
        },
    });
});

test('returns a Yggdrasil-compatible snapshot to backend tokens', async () => {
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.BACKEND,
            tokenName: 'dynamic-configuration-backend',
            environment: DEFAULT_ENV,
            projects: ['default'],
        },
    );
    await app.services.apiTokenService.fetchActiveTokens();

    const response = await app.request
        .get('/api/client/configurations')
        .set('Authorization', token.secret)
        .expect('Content-Type', /json/)
        .expect(200);

    expect(response.body.formatVersion).toBe(1);
    expect(response.body.configurations[0]).toMatchObject({
        name: 'api_timeout_ms',
        project: 'default',
        type: 'number',
        versions: [
            {
                version: 1,
                payload: {
                    type: 'number',
                    value: '5000',
                },
            },
            {
                version: 2,
                payload: {
                    type: 'number',
                    value: '2000',
                },
            },
            {
                version: 3,
                payload: {
                    type: 'number',
                    value: '4000',
                },
            },
            {
                version: 4,
                payload: {
                    type: 'number',
                    value: '3000',
                },
            },
        ],
        rules: [
            {
                expression: 'app_name in ["web-app"]',
                version: 2,
            },
            {
                expression: 'true',
                version: 1,
            },
        ],
    });
    expect(response.body.configurations[1]).toMatchObject({
        name: 'promo_banner',
        project: 'default',
        type: 'json',
        versions: [
            {
                version: 1,
                payload: {
                    type: 'json',
                    value: '{"text":"Summer sale","show":true}',
                },
            },
            {
                version: 2,
                payload: {
                    type: 'json',
                    value: '{"text":"Summer sale","show":false}',
                },
            },
        ],
        rules: [
            {
                expression: 'true',
                version: 1,
            },
        ],
    });
    expect(response.headers.etag).toBe(response.body.meta.etag);
});

test('supports conditional requests with an independent ETag', async () => {
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.BACKEND,
            tokenName: 'dynamic-configuration-etag',
            environment: DEFAULT_ENV,
            projects: ['default'],
        },
    );

    const initial = await app.request
        .get('/api/client/configurations')
        .set('Authorization', token.secret)
        .expect(200);

    await app.request
        .get('/api/client/configurations')
        .set('Authorization', token.secret)
        .set('If-None-Match', initial.headers.etag)
        .expect(304);
});

test('rejects frontend tokens', async () => {
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.FRONTEND,
            tokenName: 'dynamic-configuration-frontend',
            environment: DEFAULT_ENV,
            projects: ['default'],
        },
    );

    await app.request
        .get('/api/client/configurations')
        .set('Authorization', token.secret)
        .expect(403);
});

test('accepts the server client representation of backend tokens', async () => {
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.CLIENT,
            tokenName: 'dynamic-configuration-client',
            environment: DEFAULT_ENV,
            projects: ['default'],
        },
    );
    await app.services.apiTokenService.fetchActiveTokens();

    await app.request
        .get('/api/client/configurations')
        .set('Authorization', token.secret)
        .expect(200);
});
