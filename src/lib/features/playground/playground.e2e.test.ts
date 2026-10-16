import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import { seedDatabaseForPlaygroundTest } from '../../../test/e2e/helpers/seed-playground.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { ALL } from '../../types/models/api-token.js';
import { ApiTokenType, type IApiToken } from '../../types/model.js';
import type { ClientFeatureSchema } from '../../openapi/spec/client-feature-schema.js';
import { DEFAULT_ENV } from '../../server-impl.js';

let app: IUnleashTest;
let db: ITestDb;
let token: IApiToken;

beforeAll(async () => {
    db = await dbInit('playground_api_serial', getLogger);
    app = await setupAppWithCustomConfig(
        db.stores,
        { experimental: { flags: { playgroundFeatureEvaluation: true } } },
        db.rawDatabase,
    );
    token = await app.services.apiTokenService.createApiTokenWithProjects({
        type: ApiTokenType.ADMIN,
        tokenName: 'tester',
        environment: ALL,
        projects: [ALL],
    });
});

afterEach(async () => {
    await db.stores.featureToggleStore.deleteAll();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const flag = (
    overrides: Partial<ClientFeatureSchema>,
): ClientFeatureSchema => ({
    name: 'default-flag',
    project: 'default',
    enabled: true,
    strategies: [{ name: 'default' }],
    ...overrides,
});

test('evaluates the stored flags against the given context', async () => {
    await seedDatabaseForPlaygroundTest(
        db,
        [
            flag({ name: 'enabled-flag', project: 'project-a' }),
            flag({
                name: 'disabled-flag',
                project: 'project-b',
                enabled: false,
            }),
        ],
        DEFAULT_ENV,
    );

    const { body } = await app.request
        .post('/api/admin/playground')
        .set('Authorization', token.secret)
        .send({
            projects: ALL,
            environment: DEFAULT_ENV,
            context: { appName: 'playground-test' },
        })
        .expect(200);

    const featuresByName = body.features.toSorted((a, b) =>
        a.name.localeCompare(b.name),
    );
    expect(featuresByName).toMatchObject([
        {
            name: 'disabled-flag',
            projectId: 'project-b',
            isEnabledInCurrentEnvironment: false,
            isEnabled: false,
        },
        {
            name: 'enabled-flag',
            projectId: 'project-a',
            isEnabledInCurrentEnvironment: true,
            isEnabled: true,
        },
    ]);
});

test('evaluates a single stored flag against the given context', async () => {
    await seedDatabaseForPlaygroundTest(
        db,
        [
            flag({
                name: 'user-constrained-flag',
                project: 'project-a',
                strategies: [
                    {
                        name: 'default',
                        constraints: [
                            {
                                contextName: 'userId',
                                operator: 'IN',
                                values: ['123'],
                            },
                        ],
                    },
                ],
            }),
        ],
        DEFAULT_ENV,
    );

    const { body } = await app.request
        .post('/api/admin/playground/features/user-constrained-flag')
        .set('Authorization', token.secret)
        .send({
            environment: DEFAULT_ENV,
            context: { appName: 'playground-test', userId: '123' },
        })
        .expect(200);

    expect(body).toMatchObject({
        input: {
            environment: DEFAULT_ENV,
            context: { appName: 'playground-test', userId: '123' },
        },
        feature: {
            name: 'user-constrained-flag',
            projectId: 'project-a',
            isEnabledInCurrentEnvironment: true,
            isEnabled: true,
        },
    });
});
