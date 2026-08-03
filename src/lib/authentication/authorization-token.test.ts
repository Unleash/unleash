import { describe, expect, test } from 'vitest';
import {
    AuthorizationTokenKind,
    parseAuthorizationToken,
    parseApiToken,
    parseApiTokenV2Identifier,
} from './authorization-token.js';

describe('authorization token parser', () => {
    test('parses API token identities', () => {
        const credential = `default:production.v2_${'a'.repeat(22)}_${'b'.repeat(43)}`;

        expect(parseApiToken(credential)).toMatchObject({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            secret: credential,
            selector: 'a'.repeat(22),
        });
        expect(parseApiToken('default:production')).toEqual({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v1',
            secret: 'default:production',
        });
        expect(parseApiToken(undefined)).toBeUndefined();
        expect(parseApiTokenV2Identifier(credential)).toEqual({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            selector: 'a'.repeat(22),
        });
        expect(parseApiTokenV2Identifier('abcdefghijklmnopqrstuv')).toEqual({
            kind: AuthorizationTokenKind.API_TOKEN,
            version: 'v2',
            selector: 'abcdefghijklmnopqrstuv',
        });
        expect(parseApiTokenV2Identifier('selector')).toBeUndefined();
    });

    test('parses authorization token types', () => {
        expect(parseAuthorizationToken('user:personal-token')).toEqual({
            kind: AuthorizationTokenKind.USER_ACCESS,
            version: 'v1',
            secret: 'user:personal-token',
        });
        expect(parseAuthorizationToken('*:*global-api-token')).toEqual({
            kind: AuthorizationTokenKind.ADMIN_API_TOKEN,
            version: 'v1',
            secret: '*:*global-api-token',
        });
        expect(
            parseAuthorizationToken(
                `*:*.v2_${'a'.repeat(22)}_${'b'.repeat(43)}`,
            ),
        ).toMatchObject({
            kind: AuthorizationTokenKind.ADMIN_API_TOKEN,
            version: 'v2',
            selector: 'a'.repeat(22),
        });
    });
});
