import { describe, expect, it } from 'vitest';
import {
    hasTriggerErrors,
    initialTriggerDraft,
    matchPage,
    type TriggerDraft,
    validatePage,
    validateSelector,
    validateTriggerDraft,
} from './triggerDraft.ts';

const customDraft: TriggerDraft = {
    ...initialTriggerDraft(),
    mode: 'custom',
};

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

describe('validateTriggerDraft', () => {
    it('reports an invalid page pattern on a custom trigger', () => {
        const errors = validateTriggerDraft({
            ...customDraft,
            path: 'projects',
        });

        expect(errors.path).toBe(
            'Start the pattern with /, for example /projects/:projectId',
        );
        expect(hasTriggerErrors(errors)).toBe(true);
    });

    it('accepts the default delay and occurrence', () => {
        expect(hasTriggerErrors(validateTriggerDraft(customDraft))).toBe(false);
    });

    it.each(['', '-1', '1.5'])('rejects a delay of %j', (delayMs) => {
        expect(validateTriggerDraft({ ...customDraft, delayMs }).delayMs).toBe(
            'Enter a whole number of milliseconds, 0 or more',
        );
    });

    it.each(['', '0', '1.5'])('rejects an occurrence of %j', (onOccurrence) => {
        expect(
            validateTriggerDraft({ ...customDraft, onOccurrence }).onOccurrence,
        ).toBe('Enter a whole number, 1 or more');
    });

    it('ignores the custom fields when the survey shows whenever it is enabled', () => {
        const errors = validateTriggerDraft({
            ...customDraft,
            mode: 'always',
            path: 'projects',
            delayMs: '-1',
            onOccurrence: '0',
        });

        expect(hasTriggerErrors(errors)).toBe(false);
    });

    it('reports a missing selector and text on a click trigger', () => {
        const errors = validateTriggerDraft({
            ...customDraft,
            on: 'click',
        });

        expect(errors.selector).toBe('Enter a CSS selector, text or both');
        expect(hasTriggerErrors(errors)).toBe(true);
    });

    it('ignores the selector on a page trigger', () => {
        const errors = validateTriggerDraft({
            ...customDraft,
            selector: 'button[',
        });

        expect(hasTriggerErrors(errors)).toBe(false);
    });
});

describe('validateSelector', () => {
    it.each([
        ['a selector', ' [data-testid="create-flag"] ', ''],
        ['a selector and text', 'button', 'Create flag'],
        ['text alone', ' ', 'Create flag'],
    ])('accepts %s', (_, selector, text) => {
        expect(validateSelector(selector, text)).toBeUndefined();
    });

    it('needs a selector or text', () => {
        expect(validateSelector(' ', ' ')).toBe(
            'Enter a CSS selector, text or both',
        );
    });

    it('rejects a selector the browser cannot parse', () => {
        expect(validateSelector('button[', 'Create flag')).toBe(
            'This is not a valid CSS selector',
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
