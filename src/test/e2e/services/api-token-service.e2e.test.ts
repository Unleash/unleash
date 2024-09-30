import dbInit, { type ITestDb } from '../helpers/database-init';
import getLogger from '../../fixtures/no-logger';
import type { ApiTokenService } from '../../../lib/services/api-token-service';
import { createTestConfig } from '../../config/test-config';
import {
    ApiTokenType,
    type IApiToken,
} from '../../../lib/types/models/api-token';
import { DEFAULT_ENV } from '../../../lib/util/constants';
import { addDays } from 'date-fns';
import type ProjectService from '../../../lib/features/project/project-service';
import { createProjectService } from '../../../lib/features';
import { type IUnleashStores, TEST_AUDIT_USER } from '../../../lib/types';
import { createApiTokenService } from '../../../lib/features/api-tokens/createApiTokenService';

let db: ITestDb;
let stores: IUnleashStores;
let apiTokenService: ApiTokenService;
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

    apiTokenService = createApiTokenService(db.rawDatabase, config);
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

test('should have empty list of tokens', async () => {
    const allTokens = await apiTokenService.getAllTokens();
    const activeTokens = await apiTokenService.getAllTokens();
    expect(allTokens.length).toBe(0);
    expect(activeTokens.length).toBe(0);
});

test('should create client token', async () => {
    const token = await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: ApiTokenType.CLIENT,
        project: '*',
        environment: DEFAULT_ENV,
    });
    const allTokens = await apiTokenService.getAllTokens();

    expect(allTokens.length).toBe(1);
    expect(token.secret.length > 32).toBe(true);
    expect(token.type).toBe(ApiTokenType.CLIENT);
    expect(token.username).toBe('default-client');
    expect(allTokens[0].secret).toBe(token.secret);
});

test('should create admin token', async () => {
    const token = await apiTokenService.createApiToken({
        tokenName: 'admin',
        type: ApiTokenType.ADMIN,
        project: '*',
        environment: '*',
    });

    expect(token.secret.length > 32).toBe(true);
    expect(token.type).toBe(ApiTokenType.ADMIN);
});

test('should set expiry of token', async () => {
    const time = new Date('2022-01-01');
    await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: ApiTokenType.CLIENT,
        expiresAt: time,
        project: '*',
        environment: DEFAULT_ENV,
    });

    const [token] = await apiTokenService.getAllTokens();

    expect(token.expiresAt).toEqual(time);
});

test('should update expiry of token', async () => {
    const time = new Date('2022-01-01');
    const newTime = new Date('2023-01-01');

    const token = await apiTokenService.createApiToken(
        {
            tokenName: 'default-client',
            type: ApiTokenType.CLIENT,
            expiresAt: time,
            project: '*',
            environment: DEFAULT_ENV,
        },
        TEST_AUDIT_USER,
    );

    await apiTokenService.updateExpiry(token.secret, newTime, TEST_AUDIT_USER);

    const [updatedToken] = await apiTokenService.getAllTokens();

    expect(updatedToken.expiresAt).toEqual(newTime);
});

test('should create client token with project list', async () => {
    const token = await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: ApiTokenType.CLIENT,
        projects: ['default', 'test-project'],
        environment: DEFAULT_ENV,
    });

    expect(token.secret.slice(0, 2)).toEqual('[]');
    expect(token.projects).toStrictEqual(['default', 'test-project']);
});

test('should strip all other projects if ALL_PROJECTS is present', async () => {
    const token = await apiTokenService.createApiToken({
        tokenName: 'default-client',
        type: ApiTokenType.CLIENT,
        projects: ['*', 'default'],
        environment: DEFAULT_ENV,
    });

    expect(token.projects).toStrictEqual(['*']);
});

test('should return user with multiple projects', async () => {
    const now = Date.now();
    const tomorrow = addDays(now, 1);

    const { secret: secret1 } = await apiTokenService.createApiToken({
        tokenName: 'default-valid',
        type: ApiTokenType.CLIENT,
        expiresAt: tomorrow,
        projects: ['test-project', 'default'],
        environment: DEFAULT_ENV,
    });

    const { secret: secret2 } = await apiTokenService.createApiToken({
        tokenName: 'default-also-valid',
        type: ApiTokenType.CLIENT,
        expiresAt: tomorrow,
        projects: ['test-project'],
        environment: DEFAULT_ENV,
    });

    const multiProjectUser = await apiTokenService.getUserForToken(secret1);
    const singleProjectUser = await apiTokenService.getUserForToken(secret2);

    expect(multiProjectUser!.projects).toStrictEqual([
        'test-project',
        'default',
    ]);
    expect(singleProjectUser!.projects).toStrictEqual(['test-project']);
});

test('should not partially create token if projects are invalid', async () => {
    try {
        await apiTokenService.createApiTokenWithProjects({
            tokenName: 'default-client',
            type: ApiTokenType.CLIENT,
            projects: ['non-existent-project'],
            environment: DEFAULT_ENV,
        });
    } catch (e) {}
    const allTokens = await apiTokenService.getAllTokens();

    expect(allTokens.length).toBe(0);
});
