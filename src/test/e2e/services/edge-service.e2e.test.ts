import dbInit, { type ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import { createTestConfig } from '../../config/test-config';
import {
    ApiTokenType,
    type IApiToken,
} from '../../../lib/types/models/api-token';
import { DEFAULT_ENV } from '../../../lib/util/constants';
import { addDays, subDays } from 'date-fns';
import type ProjectService from '../../../lib/features/project/project-service';
import { createProjectService } from '../../../lib/features';
import { EdgeService } from '../../../lib/services';
import { type IUnleashStores, TEST_AUDIT_USER } from '../../../lib/types';
import { createApiTokenService } from '../../../lib/features/api-tokens/createApiTokenService';

let db: ITestDb;
let stores: IUnleashStores;
let edgeService: EdgeService;
let projectService: ProjectService;

beforeAll(async () => {
    const config = createTestConfig({
        server: { baseUriPath: '/test' },
        experimental: {
            flags: {
                useMemoizedActiveTokens: true,
            },
        },
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
    const user = await stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
    projectService = createProjectService(db.rawDatabase, config);

    await projectService.createProject(project, user, TEST_AUDIT_USER);

    const apiTokenService = createApiTokenService(db.rawDatabase, config);
    edgeService = new EdgeService({ apiTokenService }, config);
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
        type: ApiTokenType.CLIENT,
        expiresAt: yesterday,
        projects: ['*'],
        environment: DEFAULT_ENV,
    });

    const activeToken = await stores.apiTokenStore.insert({
        tokenName: 'default-valid',
        secret: '*:environment.valid-secret',
        type: ApiTokenType.CLIENT,
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
