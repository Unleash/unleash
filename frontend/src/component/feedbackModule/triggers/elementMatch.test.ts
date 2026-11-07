import { afterEach, describe, expect, it } from 'vitest';
import {
    isValidSelector,
    matchesAddedElement,
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

describe('matchesAddedElement', () => {
    const added = (html: string): Element => {
        const container = document.createElement('div');
        container.innerHTML = html;
        const element = container.firstElementChild;
        if (element === null) {
            throw new Error(`No element in ${html}`);
        }
        return element;
    };

    it('matches the added element by selector', () => {
        expect(
            matchesAddedElement(
                { selector: '[data-testid="toast"]' },
                added('<div data-testid="toast">Flag created</div>'),
            ),
        ).toBe(true);
    });

    it('matches an element inside the added subtree by selector', () => {
        expect(
            matchesAddedElement(
                { selector: '[data-testid="toast"]' },
                added('<div><p data-testid="toast">Flag created</p></div>'),
            ),
        ).toBe(true);
    });

    it('does not match when nothing in the added subtree matches the selector', () => {
        expect(
            matchesAddedElement(
                { selector: '[data-testid="toast"]' },
                added('<div><p>Flag created</p></div>'),
            ),
        ).toBe(false);
    });

    it('matches by selector and text only when a selected element has the text', () => {
        const match = { selector: '.toast', text: 'Flag created' };

        expect(
            matchesAddedElement(
                match,
                added('<div><p class="toast">Flag created</p></div>'),
            ),
        ).toBe(true);
        expect(
            matchesAddedElement(
                match,
                added('<div><p class="toast">Flag archived</p></div>'),
            ),
        ).toBe(false);
    });

    it('does not match when the selector and the text match different elements', () => {
        expect(
            matchesAddedElement(
                { selector: '.toast', text: 'Flag created' },
                added(
                    '<div class="toast"><span>Flag created</span> just now</div>',
                ),
            ),
        ).toBe(false);
    });

    it('matches by text alone against the added element', () => {
        expect(
            matchesAddedElement(
                { text: 'Flag created' },
                added('<div><svg></svg><p>Flag created</p></div>'),
            ),
        ).toBe(true);
    });

    it('matches by text alone against a descendant of the added element', () => {
        expect(
            matchesAddedElement(
                { text: 'Flag created' },
                added('<div><p>Flag created</p><button>Undo</button></div>'),
            ),
        ).toBe(true);
    });

    it('ignores differences in whitespace when matching text', () => {
        expect(
            matchesAddedElement(
                { text: ' Flag created ' },
                added('<div>Flag  \n created</div>'),
            ),
        ).toBe(true);
    });

    it('does not match an element whose text only partly matches', () => {
        expect(
            matchesAddedElement(
                { text: 'Flag' },
                added('<div><p>Flag created</p></div>'),
            ),
        ).toBe(false);
    });

    it('does not match text spread over sibling elements', () => {
        expect(
            matchesAddedElement(
                { text: 'Flag created' },
                added('<div><p>Flag</p><p>created</p><p>now</p></div>'),
            ),
        ).toBe(false);
    });
});
