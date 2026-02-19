import { describe, expect, test } from 'vitest';
import { allOperators } from 'constants/operators';
import { constraintValidator } from './constraint-validator';

describe('constraintValidator', () => {
    describe('number operator', () => {
        const validate = constraintValidator('NUM_EQ');

        test('accepts valid numbers', () => {
            expect(validate('123')).toEqual([true, '']);
            expect(validate('0')).toEqual([true, '']);
            expect(validate('-1')).toEqual([true, '']);
            expect(validate('3.14')).toEqual([true, '']);
        });

        test('rejects non-numeric strings', () => {
            const [valid] = validate('abc');
            expect(valid).toBe(false);
        });

        test('gives a hint when comma is used as decimal separator', () => {
            const [valid, message] = validate('3,14');
            expect(valid).toBe(false);
            expect(message).toContain('Comma');
        });
    });

    describe('semver operator', () => {
        const validate = constraintValidator('SEMVER_EQ');

        test('accepts valid semver', () => {
            expect(validate('1.2.3')).toEqual([true, '']);
            expect(validate('0.0.1')).toEqual([true, '']);
        });

        test('rejects invalid semver', () => {
            const [valid] = validate('not-semver');
            expect(valid).toBe(false);
        });

        test('rejects unclean semver', () => {
            const [valid] = validate('v1.2.3');
            expect(valid).toBe(false);
        });
    });

    describe('date operator', () => {
        const validate = constraintValidator('DATE_AFTER');

        test('accepts valid ISO dates', () => {
            expect(validate('2024-01-15T00:00:00Z')).toEqual([true, '']);
            expect(validate('2024-06-01')).toEqual([true, '']);
        });

        test('rejects invalid dates', () => {
            const [valid] = validate('not-a-date');
            expect(valid).toBe(false);
        });
    });

    describe('regex operator', () => {
        const validate = constraintValidator('REGEX');

        test('accepts valid regex', () => {
            expect(validate('^foo.*bar$')).toEqual([true, '']);
            expect(validate('[a-z]+')).toEqual([true, '']);
        });

        test('rejects invalid regex', () => {
            const [valid, message] = validate('[invalid');
            expect(valid).toBe(false);
            expect(message).toMatch(/Value must be a valid RE2 regex\. Error/);

            // This assertion is a bit brittle, but it ensures that the error message from the RE2 parser is included in the final message
            expect(message).toBe(
                'Value must be a valid RE2 regex. Error parsing regexp: missing closing ]: `[invalid`',
            );
        });
    });

    describe('string list operator (default)', () => {
        const validate = constraintValidator('IN');

        test('accepts string values', () => {
            expect(validate('hello', 'world')).toEqual([true, '']);
        });
    });

    test('every operator has a validator', () => {
        for (const operator of allOperators) {
            const validator = constraintValidator(operator);
            expect(validator, `missing validator for ${operator}`).toBeTypeOf(
                'function',
            );
        }
    });
});
