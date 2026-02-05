import dbInit, { type ITestDb } from '../helpers/database-init.js';
import getLogger from '../../fixtures/no-logger.js';
import { createTestConfig } from '../../config/test-config.js';
import { ApiTokenType, type IApiToken } from '../../../lib/types/model.js';
import { DEFAULT_ENV } from '../../../lib/util/constants.js';
import { addDays, subDays } from 'date-fns';
import type ProjectService from '../../../lib/features/project/project-service.js';
import { createProjectService } from '../../../lib/features/index.js';
import { EdgeService } from '../../../lib/services/index.js';
import {
    type IUnleashStores,
    type IUser,
    SYSTEM_USER_AUDIT,
    TEST_AUDIT_USER,
} from '../../../lib/types/index.js';
import { createApiTokenService } from '../../../lib/features/api-tokens/createApiTokenService.js';

let db: ITestDb;
let stores: IUnleashStores;
let edgeService: EdgeService;
let projectService: ProjectService;
let user: IUser;

beforeAll(async () => {
    const config = createTestConfig({
        server: { baseUriPath: '/test' },
        experimental: {
            flags: {
                useMemoizedActiveTokens: true,
            },
        },
        edgeMasterSecret: '5ja3QXrqi4T2A+V+0QOw8eTA68lsHQE81vNO80MGrhw=',
    });
    db = await dbInit('api_token_service_serial', getLogger);
    stores = db.stores;
    const project = {
        id: 'test-project',
        name: 'Test Project',
        description: 'Fancy',
        mode: 'open' as const,
        defaultStickiness: 'clientId',
    };
    user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    projectService = createProjectService(db.rawDatabase, config);

    await projectService.createProject(project, user, TEST_AUDIT_USER);

    const apiTokenService = createApiTokenService(db.rawDatabase, config);

    edgeService = new EdgeService(
        { edgeStore: db.stores.edgeTokenStore },
        { apiTokenService },
        config,
    );
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    const tokens = await stores.apiTokenStore.getAll();
    const deleteAll = tokens.map((t: IApiToken) =>
        stores.apiTokenStore.delete(t.secret),
    );
    await Promise.all(deleteAll);
});

test('should only return valid tokens', async () => {
    const now = Date.now();
    const yesterday = subDays(now, 1);
    const tomorrow = addDays(now, 1);

    const expiredToken = await stores.apiTokenStore.insert({
        tokenName: 'expired',
        secret: '*:environment.expired-secret',
        type: ApiTokenType.BACKEND,
        expiresAt: yesterday,
        projects: ['*'],
        environment: DEFAULT_ENV,
    });

    const activeToken = await stores.apiTokenStore.insert({
        tokenName: 'default-valid',
        secret: '*:environment.valid-secret',
        type: ApiTokenType.BACKEND,
        expiresAt: tomorrow,
        projects: ['*'],
        environment: DEFAULT_ENV,
    });

    const response = await edgeService.getValidTokens([
        activeToken.secret,
        expiredToken.secret,
    ]);

    expect(response.tokens.length).toBe(1);
    expect(activeToken.secret).toBe(response.tokens[0].token);
});

describe('Enterprise Edge - Generated tokens', () => {
    const clientId = 'enterprise-edge';
    beforeAll(async () => {
        await edgeService.saveClient(clientId, 'mySecret');
        const project1 = {
            id: 'project1',
            name: 'Test Project',
            description: 'Fancy',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project1, user, SYSTEM_USER_AUDIT);
        const project2 = {
            id: 'project2',
            name: 'Another Project',
            description: 'Not so fancy',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(project2, user, SYSTEM_USER_AUDIT);
        const aProject = {
            id: 'a-project',
            name: 'A Project',
            description: 'Fancy',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(aProject, user, SYSTEM_USER_AUDIT);
        const zProject = {
            id: 'z-project',
            name: 'Z Project',
            description: 'Fancy',
            mode: 'open' as const,
            defaultStickiness: 'clientId',
        };
        await projectService.createProject(zProject, user, SYSTEM_USER_AUDIT);
    });
    test('saving a token should make it fetchable from clientId, environment and projects', async () => {
        const tokens = await edgeService.getOrCreateTokens(clientId, {
            tokens: [
                {
                    environment: 'development',
                    projects: ['project1', 'project2'],
                },
            ],
        });
        expect(tokens.tokens).toHaveLength(1);
        const refetched = await edgeService.getOrCreateTokens(
            'enterprise-edge',
            {
                tokens: [
                    {
                        environment: 'development',
                        projects: ['project1', 'project2'],
                    },
                ],
            },
        );
        const first = tokens.tokens[0];
        const second = refetched.tokens[0];
        expect(first.token).toStrictEqual(second.token);
    });
    test(`order of projects doesn't matter for uniqueness comparison`, async () => {
        const tokens = await edgeService.getOrCreateTokens(clientId, {
            tokens: [
                {
                    environment: 'development',
                    projects: [
                        'a-project',
                        'project2',
                        'project1',
                        'z-project',
                    ],
                },
            ],
        });
        expect(tokens.tokens).toHaveLength(1);
        const refetched = await edgeService.getOrCreateTokens(clientId, {
            tokens: [
                {
                    environment: 'development',
                    projects: [
                        'z-project',
                        'project1',
                        'project2',
                        'a-project',
                    ],
                },
            ],
        });
        const first = tokens.tokens[0];
        const second = refetched.tokens[0];
        expect(first.token).toStrictEqual(second.token);
    });
});
