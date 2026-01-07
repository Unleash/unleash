import { generateImageUrl } from './generateImageUrl.js';

describe('Gravatar image url', () => {
    it('generates the correct sha-256 hash for gravatars test idents', () => {
        expect(generateImageUrl({ email: 'MyEmailAddress@example.com' })).toBe(
            'https://gravatar.com/avatar/84059b07d4be67b806386c0aad8070a23f18836bbaae342275dc0a83414c32ee?s=42&d=retro&r=g',
        );
    });
    it('lowercases and trims all emails', () => {
        const upperCaseAndLeadingSpace = ' helloWorld@example.com';
        const upperCaseAndTrailingSpace = 'helloWorld@exAMPLE.com ';
        const lowerCaseAndNoSpaces = 'helloworld@example.com';
        const uCALSHash = generateImageUrl({ email: upperCaseAndLeadingSpace });
        const uCATSHash = generateImageUrl({
            email: upperCaseAndTrailingSpace,
        });
        const lCANSHash = generateImageUrl({ email: lowerCaseAndNoSpaces });
        expect(uCALSHash).toBe(uCATSHash);
        expect(uCATSHash).toBe(lCANSHash);
    });
});
