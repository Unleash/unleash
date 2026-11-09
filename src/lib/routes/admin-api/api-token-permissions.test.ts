import { describe, expect, test } from 'vitest';
import { ApiTokenType, type IApiToken } from '../../types/model.js';
import {
    ADMIN,
    CREATE_CLIENT_API_TOKEN,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
} from '../../types/permissions.js';
import type { IUserPermission } from '../../types/stores/access-store.js';
import { canReadApiToken } from './api-token-permissions.js';

const token = (type: ApiTokenType, projects: string[]): IApiToken =>
    ({ type, projects }) as IApiToken;

const permission = (name: string, project?: string): IUserPermission => ({
    permission: name,
    project,
});

describe('canReadApiToken', () => {
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
    });
});
