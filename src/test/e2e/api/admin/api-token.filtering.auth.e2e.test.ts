import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { ApiTokenType } from '../../../../lib/types/model.js';
import { DEFAULT_ENV } from '../../../../lib/util/index.js';
import {
    SYSTEM_USER_AUDIT,
    SYSTEM_USER_ID,
} from '../../../../lib/server-impl.js';

let db: ITestDb;
let app: IUnleashTest;

beforeAll(async () => {
    db = await dbInit('token_api_project_token_filtering', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
    await app.destroy();
});

afterEach(async () => {
    await db.stores.apiTokenStore.deleteAll();
});

test('finds tokens and stuff', async () => {
    const tokenSecret = 'random-secret';
    const tokenSecretNotShown = 'other-random-secret';

    const project_access = await db.stores.projectStore.create({
        id: 'other',
        name: 'other',
        description: 'other',
        mode: 'open',
    });

    const project_no_access = await db.stores.projectStore.create({
        id: 'no_access',
        name: 'no_access',
        description: 'no_access',
        mode: 'protected',
    });

    const token_shown = await db.stores.apiTokenStore.insert({
        tokenName: 'test',
        secret: tokenSecret,
        type: ApiTokenType.BACKEND,
        environment: DEFAULT_ENV,
        projects: ['default', project_access.id, project_no_access.id],
    });

    const token_not_shown = await db.stores.apiTokenStore.insert({
        tokenName: 'test_not_shown',
        secret: tokenSecretNotShown,
        type: ApiTokenType.BACKEND,
        environment: DEFAULT_ENV,
        projects: [project_no_access.id],
    });

    const projectMember = await app.services.userService.createUser({
        username: 'custom',
        name: 'Custom',
        email: 'custom@getunleash.io',
        rootRole: 2,
    });

    const customRole = await app.services.accessService.createRole(
        {
            name: 'Project api token reader',
            description: '',
            permissions: [
                {
                    id: 42, // "READ_PROJECT_API_TOKEN"
                },
            ],
            createdByUserId: SYSTEM_USER_ID,
        },
        SYSTEM_USER_AUDIT,
    );

    await app.services.projectService.addAccess(
        project_access.id,
        [customRole.id],
        [], // no groups
        [projectMember.id],
        SYSTEM_USER_AUDIT,
    );
    await app.login({
        email: projectMember.email!,
    });

    const result = await app.request
        .get(`/api/admin/api-tokens`)
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(result.body.tokens.length).toBe(1);

    expect(result.body).toMatchObject({
        tokens: [
            {
                secret: tokenSecret,
                tokenName: token_shown.tokenName,
                type: 'client',
                projects: token_shown.projects,
            },
        ],
    });
});
