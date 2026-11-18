import { describe, expect, test } from 'vitest';
import { ApiTokenType, type IApiToken } from '../../types/model.js';
import {
    ADMIN,
    CREATE_CLIENT_API_TOKEN,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
    READ_PROJECT_API_TOKEN,
} from '../../types/permissions.js';
import type { IUserPermission } from '../../types/stores/access-store.js';
import {
    canReadApiToken,
    canReadProjectApiToken,
} from './api-token-permissions.js';

const token = (type: ApiTokenType, projects: string[]): IApiToken =>
    ({ type, projects }) as IApiToken;

const permission = (name: string, project?: string): IUserPermission => ({
    permission: name,
    project,
});

describe('canReadApiToken', () => {
    test('project listing accepts project read permission for every token project', () => {
        const permissions = [permission(READ_PROJECT_API_TOKEN, 'alpha')];
        for (const type of [
            ApiTokenType.CLIENT,
            ApiTokenType.BACKEND,
            ApiTokenType.FRONTEND,
        ]) {
            expect(
                canReadProjectApiToken(permissions, token(type, ['alpha'])),
            ).toBe(true);
            expect(canReadApiToken(permissions, token(type, ['alpha']))).toBe(
                false,
            );
            expect(
                canReadProjectApiToken(
                    permissions,
                    token(type, ['alpha', 'beta']),
                ),
            ).toBe(false);
            expect(
                canReadProjectApiToken(
                    [
                        ...permissions,
                        permission(READ_PROJECT_API_TOKEN, 'beta'),
                    ],
                    token(type, ['alpha', 'beta']),
                ),
            ).toBe(true);
            expect(
                canReadProjectApiToken(permissions, token(type, ['*'])),
            ).toBe(false);
        }
        expect(
            canReadProjectApiToken(
                [permission(READ_PROJECT_API_TOKEN)],
                token(ApiTokenType.CLIENT, ['*']),
            ),
        ).toBe(false);
        expect(
            canReadProjectApiToken(permissions, token(ApiTokenType.CLIENT, [])),
        ).toBe(false);
        expect(
            canReadProjectApiToken(
                permissions,
                token(ApiTokenType.ADMIN, ['alpha']),
            ),
        ).toBe(false);
    });
    test('requires the token type read permission on every project', () => {
        const client = token(ApiTokenType.CLIENT, ['alpha', 'beta']);
        expect(
            canReadApiToken(
                [permission(READ_CLIENT_API_TOKEN, 'alpha')],
                client,
            ),
        ).toBe(false);
        expect(
            canReadApiToken(
                [
                    permission(READ_CLIENT_API_TOKEN, 'alpha'),
                    permission(READ_CLIENT_API_TOKEN, 'beta'),
                ],
                client,
            ),
        ).toBe(true);
        expect(
            canReadApiToken(
                [permission(READ_CLIENT_API_TOKEN, 'alpha')],
                token(ApiTokenType.BACKEND, ['alpha']),
            ),
        ).toBe(true);
    });

    test('requires a global read permission for an all-projects token', () => {
        const frontend = token(ApiTokenType.FRONTEND, ['*']);
        expect(
            canReadApiToken(
                [permission(READ_FRONTEND_API_TOKEN, 'alpha')],
                frontend,
            ),
        ).toBe(false);
        expect(
            canReadApiToken([permission(READ_FRONTEND_API_TOKEN)], frontend),
        ).toBe(true);
        expect(
            canReadApiToken(
                [permission(READ_FRONTEND_API_TOKEN, '*')],
                frontend,
            ),
        ).toBe(true);
    });

    test('global token read permission covers a specific project', () => {
        const client = token(ApiTokenType.CLIENT, ['alpha']);
        for (const project of [undefined, '*']) {
            expect(
                canReadApiToken(
                    [permission(READ_CLIENT_API_TOKEN, project)],
                    client,
                ),
            ).toBe(true);
        }
    });

    test('project token read permission requires a specific matching project', () => {
        for (const project of [undefined, '*']) {
            const permissions = [permission(READ_PROJECT_API_TOKEN, project)];
            expect(
                canReadProjectApiToken(
                    permissions,
                    token(ApiTokenType.CLIENT, ['alpha']),
                ),
            ).toBe(false);
            expect(
                canReadProjectApiToken(
                    permissions,
                    token(ApiTokenType.CLIENT, ['*']),
                ),
            ).toBe(false);
        }
    });

    test('does not use other token permissions as read access', () => {
        const client = token(ApiTokenType.CLIENT, ['alpha']);
        expect(
            canReadApiToken([permission(READ_FRONTEND_API_TOKEN)], client),
        ).toBe(false);
        expect(
            canReadApiToken([permission(CREATE_CLIENT_API_TOKEN)], client),
        ).toBe(false);
        expect(canReadApiToken([], client)).toBe(false);
    });

    test('only global admin permission can read an admin token', () => {
        const admin = token(ApiTokenType.ADMIN, ['*']);
        expect(
            canReadApiToken([permission(READ_CLIENT_API_TOKEN)], admin),
        ).toBe(false);
        expect(canReadApiToken([permission(ADMIN, 'alpha')], admin)).toBe(
            false,
        );
        expect(canReadApiToken([permission(ADMIN)], admin)).toBe(true);
        expect(canReadApiToken([permission(ADMIN, '*')], admin)).toBe(true);
    });

    test('project-scoped admin does not grant token access', () => {
        const client = token(ApiTokenType.CLIENT, ['alpha']);
        for (const canRead of [canReadApiToken, canReadProjectApiToken]) {
            expect(canRead([permission(ADMIN, 'alpha')], client)).toBe(false);
            expect(canRead([permission(ADMIN)], client)).toBe(true);
            expect(canRead([permission(ADMIN, '*')], client)).toBe(true);
        }
    });
});
