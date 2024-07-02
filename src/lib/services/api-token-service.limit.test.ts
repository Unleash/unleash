import { ApiTokenService } from './api-token-service';
import { createTestConfig } from '../../test/config/test-config';
import type { IUnleashConfig } from '../server-impl';
import { ApiTokenType } from '../types/models/api-token';
import FakeApiTokenStore from '../../test/fixtures/fake-api-token-store';
import FakeEnvironmentStore from '../features/project-environments/fake-environment-store';
import { createFakeEventsService } from '../../lib/features';
import { ExceedsLimitError } from '../error/exceeds-limit-error';

const createServiceWithLimit = (limit: number) => {
    const config: IUnleashConfig = createTestConfig({
        experimental: {
            flags: {
                resourceLimits: true,
            },
        },
    });

    const apiTokenStore = new FakeApiTokenStore();
    const environmentStore = new FakeEnvironmentStore();
    environmentStore.create({
        name: 'production',
        type: 'production',
        enabled: true,
        protected: true,
        sortOrder: 1,
    });

    const eventService = createFakeEventsService(config);

    const service = new ApiTokenService(
        { apiTokenStore, environmentStore },
        {
            ...config,
            resourceLimits: {
                apiTokens: limit,
            },
        },
        eventService,
    );

    return service;
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

test.each([ApiTokenType.ADMIN, ApiTokenType.CLIENT, ApiTokenType.FRONTEND])(
    "Should prevent you from creating %s tokens when you're already at the limit",
    async (tokenType) => {
        const limit = 1;
        const service = createServiceWithLimit(limit);
        const auditUser = {
            id: 1,
            username: 'audit user',
            ip: '127.0.0.1',
        };

        await service.createApiTokenWithProjects(
            {
                tokenName: 'token-1',
                type: ApiTokenType.CLIENT,
                environment: 'production',
                projects: ['*'],
            },
            auditUser,
        );

        const environment =
            tokenType === ApiTokenType.ADMIN ? '*' : 'production';

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
    },
);
