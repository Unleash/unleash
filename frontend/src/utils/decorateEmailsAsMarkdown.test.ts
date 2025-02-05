import { decorateEmailsAsMarkdown } from './decorateEmailsAsMarkdown';

describe('decorateEmailsAsMarkdown', () => {
    it('decorates a plain email', () => {
        const input =
            'Please contact your account representative or contact@mydomain.com. Thanks!';
        const expected =
            'Please contact your account representative or [contact@mydomain.com](contact@mydomain.com). Thanks!';
        expect(decorateEmailsAsMarkdown(input)).toBe(expected);
    });

    it('does not re-decorate an already decorated email', () => {
        const input =
            'Reach us at [contact@mydomain.com](contact@mydomain.com)';
        expect(decorateEmailsAsMarkdown(input)).toBe(input);
    });

    it('handles multiple emails in a string', () => {
        const input = 'Emails: first@example.com, second@example.com';
        const expected =
            'Emails: [first@example.com](first@example.com), [second@example.com](second@example.com)';
        expect(decorateEmailsAsMarkdown(input)).toBe(expected);
    });

    it('handles multiple emails in a string when some are decorated', () => {
        const input =
            'Emails: [first@example.com](first@example.com), second@example.com';
        const expected =
            'Emails: [first@example.com](first@example.com), [second@example.com](second@example.com)';
        expect(decorateEmailsAsMarkdown(input)).toBe(expected);
    });

    it('ignores invalid email patterns', () => {
        const input = 'Not an email: test@@example..com';
        expect(decorateEmailsAsMarkdown(input)).toBe(input);
    });

    it('decorates emails adjacent to punctuation', () => {
        const input = 'Contact:contact@mydomain.com, for info.';
        const expected =
            'Contact:[contact@mydomain.com](contact@mydomain.com), for info.';
        expect(decorateEmailsAsMarkdown(input)).toBe(expected);
    });
});
