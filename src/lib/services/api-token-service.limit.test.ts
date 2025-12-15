import { createTestConfig } from '../../test/config/test-config.js';
import type { IUnleashConfig } from '../types/index.js';
import { ApiTokenType } from '../types/model.js';
import { ExceedsLimitError } from '../error/exceeds-limit-error.js';
import { createFakeApiTokenService } from '../features/api-tokens/createApiTokenService.js';

const createServiceWithLimit = (limit: number) => {
    const config: IUnleashConfig = createTestConfig({
        experimental: {
            flags: {},
        },
    });
    config.resourceLimits.apiTokens = limit;

    const { apiTokenService, environmentStore } =
        createFakeApiTokenService(config);

    environmentStore.create({
        name: 'production',
        type: 'production',
        enabled: true,
        sortOrder: 1,
    });
    return apiTokenService;
};

test('Should allow you to create tokens up to and including the limit', async () => {
    const limit = 3;
    const service = createServiceWithLimit(limit);

    for (let i = 0; i < limit; i++) {
        await service.createApiTokenWithProjects(
            {
                tokenName: `token-${i}`,
                type: ApiTokenType.CLIENT,
                environment: 'production',
                projects: ['*'],
            },
            {
                id: 1,
                username: 'audit user',
                ip: '127.0.0.1',
            },
        );
    }
});

test.each([
    ApiTokenType.ADMIN,
    ApiTokenType.CLIENT,
    ApiTokenType.BACKEND,
    ApiTokenType.FRONTEND,
])("Should prevent you from creating %s tokens when you're already at the limit", async (tokenType) => {
    const limit = 1;
    const service = createServiceWithLimit(limit);
    const auditUser = {
        id: 1,
        username: 'audit user',
        ip: '127.0.0.1',
    };

    await service.createApiTokenWithProjects(
        {
            tokenName: `token-1-${tokenType}`,
            type: ApiTokenType.CLIENT,
            environment: 'production',
            projects: ['*'],
        },
        auditUser,
    );

    const environment = tokenType === ApiTokenType.ADMIN ? '*' : 'production';

    await expect(
        service.createApiTokenWithProjects(
            {
                tokenName: 'exceeds-limit',
                type: tokenType,
                environment,
                projects: ['*'],
            },
            auditUser,
        ),
    ).rejects.toThrow(ExceedsLimitError);
});
