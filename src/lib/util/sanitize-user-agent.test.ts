import {
    MAX_USER_AGENT_LENGTH,
    sanitizeUserAgent,
} from './sanitize-user-agent.js';

const CHROME =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36';

describe('sanitizeUserAgent()', () => {
    test('should keep a normal user-agent unchanged', () => {
        expect(sanitizeUserAgent(CHROME)).toBe(CHROME);
    });

    test.each([
        ['undefined', undefined],
        ['empty', ''],
        ['whitespace only', '   '],
        ['only non-printable characters', '\u0000\u001B'],
    ])('should return undefined when input %s', (_label, input) => {
        expect(sanitizeUserAgent(input)).toBeUndefined();
    });

    test('should strip control, format and other non-printable characters', () => {
        expect(
            sanitizeUserAgent('Mozilla/5.0\u0000 \u001B[31mEvilTest\u007F'),
        ).toBe('Mozilla/5.0 [31mEvilTest');
    });

    test('should truncate an user-agent above max length', () => {
        expect(sanitizeUserAgent('a'.repeat(10_000))).toHaveLength(
            MAX_USER_AGENT_LENGTH,
        );
    });

    test('should not leave half a surrogate pair behind when truncating', () => {
        // the emoji straddles the cut-off, so slicing alone would leave a lone
        // surrogate - invalid UTF-8, which Postgres refuses to store
        const sanitized = sanitizeUserAgent(
            `${'a'.repeat(MAX_USER_AGENT_LENGTH - 1)}\u{1F600}tail`,
        );

        expect(sanitized).toBe('a'.repeat(MAX_USER_AGENT_LENGTH - 1));
        expect(sanitized).toEqual(expect.not.stringMatching(/\p{Cs}/u));
    });
});
