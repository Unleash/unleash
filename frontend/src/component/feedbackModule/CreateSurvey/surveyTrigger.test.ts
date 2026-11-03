import { describe, expect, it } from 'vitest';
import {
    isValidPagePattern,
    matchPage,
    validatePage,
} from './surveyTrigger.ts';

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

describe('validatePage', () => {
    it.each([
        '',
        ' ',
        ' /projects/:projectId ',
        '/projects/:projectId',
        '/projects/*',
        '/projects/:projectId/features/:featureId',
    ])('accepts %j', (page) => {
        expect(validatePage(page)).toBeUndefined();
    });

    it('needs a page pattern to start with a slash', () => {
        expect(validatePage('projects/:projectId')).toBe(
            'Start the pattern with /, for example /projects/:projectId',
        );
    });

    it('rejects a page pattern URLPattern cannot parse', () => {
        expect(validatePage('/projects/(')).toBe(
            'This is not a valid page pattern',
        );
    });
});

describe('matchPage', () => {
    it.each([
        ['/projects/:projectId', 'https://app.example.com/projects/default'],
        ['/projects/:projectId', '/projects/default?tab=flags#top'],
        ['/projects/*', '/projects/default/features/new'],
    ])('matches %s against %s', (page, url) => {
        expect(matchPage(page, url)).toBe('match');
    });

    it('matches every page with an empty pattern', () => {
        expect(matchPage('', '/anything')).toBe('match-every-page');
    });

    it('does not match a path with an extra segment', () => {
        expect(
            matchPage('/projects/:projectId', '/projects/default/settings'),
        ).toBe('no-match');
    });

    it('cannot try an invalid pattern', () => {
        expect(matchPage('projects', '/projects')).toBe('invalid-pattern');
    });

    it('needs a full URL or a path', () => {
        expect(matchPage('/projects', 'app.example.com/projects')).toBe(
            'invalid-url',
        );
    });
});
