import { describe, expect, test } from 'vitest';
import { validateFeatureNamingExample } from './ProjectEnterpriseSettingsForm.jsx';

describe('validateFeatureNaming', () => {
    test.each([
        '+',
        'valid regex$',
    ])(`if the featureNamingPatternError prop is present, it's always valid: %s`, (pattern) => {
        const result = validateFeatureNamingExample({
            pattern,
            example: 'aohutnasoehutns',
            featureNamingPatternError: 'error',
        });

        expect(result.state).toBe('valid');
    });
    test(`if the pattern is empty, the example is always valid`, () => {
        const result = validateFeatureNamingExample({
            pattern: '',
            example: 'aohutnasoehutns',
            featureNamingPatternError: undefined,
        });

        expect(result.state).toBe('valid');
    });
    test(`if the example is empty, the it's always valid`, () => {
        const result = validateFeatureNamingExample({
            pattern: '^dx-[a-z]{1,5}$',
            example: '',
            featureNamingPatternError: undefined,
        });

        expect(result.state).toBe('valid');
    });

    test.each([
        ['valid', 'dx-logs'],
        ['invalid', 'axe-battles'],
    ])(`if example is %s, the state should be be the same`, (state, example) => {
        const result = validateFeatureNamingExample({
            pattern: '^dx-[a-z]{1,5}$',
            example,
            featureNamingPatternError: undefined,
        });

        expect(result.state).toBe(state);
    });

    test('the pattern gets an implicit leading ^ and trailing $ added', () => {
        const result = validateFeatureNamingExample({
            pattern: '[a-z]+',
            example: 'not.valid',
            featureNamingPatternError: undefined,
        });

        expect(result.state).toBe('invalid');
    });

    test.each([
        ['valid', 'release-checkout'],
        ['valid', 'exp-checkout'],
        ['invalid', 'release-checkout-2'],
        ['invalid', 'my-exp-checkout'],
    ])('the implicit ^ and $ apply to every branch of a top-level alternation: %s for %s', (state, example) => {
        const result = validateFeatureNamingExample({
            pattern: 'release-[a-z]+|exp-[a-z]+',
            example,
            featureNamingPatternError: undefined,
        });

        expect(result.state).toBe(state);
    });
});
