import { afterEach, describe, expect, it } from 'vitest';
import {
    isValidSelector,
    matchesElement,
    parseElementMatch,
} from './elementMatch.ts';

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
        ['whitespace-only text', { text: '  ' }],
        ['non-string text', { text: 42 }],
    ])('rejects %s', (_, raw) => {
        expect(parseElementMatch(raw)).toBeNull();
    });
});

describe('matchesElement', () => {
    const render = (html: string): void => {
        document.body.innerHTML = html;
    };
    const target = (selector: string): Element => {
        const element = document.querySelector(selector);
        if (element === null) {
            throw new Error(`No element matches ${selector}`);
        }
        return element;
    };

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('matches the clicked element by selector', () => {
        render('<button data-testid="create-flag">Create flag</button>');

        expect(
            matchesElement(
                { selector: '[data-testid="create-flag"]' },
                target('button'),
            ),
        ).toBe(true);
    });

    it('matches a click inside an element that the selector matches', () => {
        render(
            '<button data-testid="create-flag"><span>Create</span></button>',
        );

        expect(
            matchesElement(
                { selector: '[data-testid="create-flag"]' },
                target('span'),
            ),
        ).toBe(true);
    });

    it('does not match a click outside the selected element', () => {
        render('<button data-testid="create-flag">Create</button><p>Other</p>');

        expect(
            matchesElement(
                { selector: '[data-testid="create-flag"]' },
                target('p'),
            ),
        ).toBe(false);
    });

    it('matches by selector and text only when the selected element has the text', () => {
        render(
            '<button class="x">Create flag</button><button class="x">Delete</button>',
        );
        const match = { selector: '.x', text: 'Create flag' };

        expect(matchesElement(match, target('button:first-child'))).toBe(true);
        expect(matchesElement(match, target('button:last-child'))).toBe(false);
    });

    it('matches by selector and text against any selected ancestor that has the text', () => {
        render(
            '<button class="action"><span class="action">Create</span> flag</button>',
        );

        expect(
            matchesElement(
                { selector: '.action', text: 'Create flag' },
                target('span'),
            ),
        ).toBe(true);
    });

    it('does not match when the selector and the text match different elements', () => {
        render('<div><span class="x">Create</span> flag</div>');

        expect(
            matchesElement(
                { selector: '.x', text: 'Create flag' },
                target('span'),
            ),
        ).toBe(false);
    });

    it('matches by text alone against the clicked element or an ancestor', () => {
        render('<button><svg></svg><span>Create flag</span></button>');

        expect(matchesElement({ text: 'Create flag' }, target('svg'))).toBe(
            true,
        );
    });

    it('does not match the document body even when its text matches', () => {
        render('<button>Create flag</button>');

        expect(matchesElement({ text: 'Create flag' }, document.body)).toBe(
            false,
        );
    });

    it('does not match the document element even when its text matches', () => {
        render('<button>Create flag</button>');

        expect(
            matchesElement({ text: 'Create flag' }, document.documentElement),
        ).toBe(false);
    });

    it('ignores differences in whitespace when matching text', () => {
        render('<button>Create  \n flag</button>');

        expect(
            matchesElement({ text: ' Create flag ' }, target('button')),
        ).toBe(true);
    });

    it('does not match an element whose text only partly matches', () => {
        render('<button>Create flag</button>');

        expect(matchesElement({ text: 'Create' }, target('button'))).toBe(
            false,
        );
    });
});
