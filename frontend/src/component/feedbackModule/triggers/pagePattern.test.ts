import { describe, expect, it } from 'vitest';
import { isValidPagePattern } from './pagePattern.ts';

describe('isValidPagePattern', () => {
    it.each([
        '/',
        '/projects',
        '/projects/:projectId',
        '/projects/:projectId/features/*',
        '/projects/:projectId/features/:featureId?',
        '/(projects|features)',
    ])('accepts %s', (pattern) => {
        expect(isValidPagePattern(pattern)).toBe(true);
    });

    it.each([
        ['an empty string', ''],
        ['a relative path', 'projects'],
        ['a full URL', 'https://example.com/projects'],
        ['an unclosed group', '/projects/('],
    ])('rejects %s', (_, pattern) => {
        expect(isValidPagePattern(pattern)).toBe(false);
    });
});
