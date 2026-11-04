import { describe, expect, it } from 'vitest';
import { isValidSelector, parseElementMatch } from './elementMatch.ts';

describe('isValidSelector', () => {
    it.each([
        'button',
        '[data-testid="create-flag"]',
        '#create-flag',
        'nav > a.active',
    ])('accepts %s', (selector) => {
        expect(isValidSelector(selector)).toBe(true);
    });

    it.each([
        ['an empty string', ''],
        ['an unclosed attribute', 'button['],
        ['a dangling combinator', 'nav >'],
    ])('rejects %s', (_, selector) => {
        expect(isValidSelector(selector)).toBe(false);
    });
});

describe('parseElementMatch', () => {
    it.each([
        ['a selector', { selector: 'button' }],
        ['a selector and text', { selector: 'button', text: 'Create flag' }],
        ['text alone', { text: 'Create flag' }],
    ])('reads %s', (_, raw) => {
        expect(parseElementMatch(raw)).toStrictEqual(raw);
    });

    it.each([
        ['neither a selector nor text', {}],
        ['an invalid selector', { selector: 'button[' }],
        ['a non-string selector', { selector: 42 }],
        ['empty text', { selector: 'button', text: '' }],
        ['non-string text', { text: 42 }],
    ])('rejects %s', (_, raw) => {
        expect(parseElementMatch(raw)).toBeNull();
    });
});
