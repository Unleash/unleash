import { validateSemver, validateLegalValues } from './constraint-types';
import { ILegalValue } from '../../types/stores/context-field-store';

const legalValues: Readonly<ILegalValue[]> = [
    { value: '100' },
    { value: '200' },
    { value: '300' },
];

test('semver validation should throw with bad format', () => {
    const badSemver = 'a.b.c';
    expect.assertions(1);

    try {
        validateSemver(badSemver);
    } catch (e) {
        expect(e.message).toBe(
            `the provided value is not a valid semver format. The value provided was: ${badSemver}`,
        );
    }
});

test('semver valdiation should pass with correct format', () => {
    const validSemver = '1.2.3';
    expect.assertions(0);

    try {
        validateSemver(validSemver);
    } catch (e) {
        expect(e.message).toBe(
            `the provided value is not a valid semver format. The value provided was: ${validSemver}`,
        );
    }
});

test('semver validation should fail partial semver', () => {
    const partial = '1.2';
    expect.assertions(1);

    try {
        validateSemver(partial);
    } catch (e) {
        expect(e.message).toBe(
            `the provided value is not a valid semver format. The value provided was: ${partial}`,
        );
    }
});

test('semver validation should fail with leading v', () => {
    const leadingV = 'v1.2.0';
    expect.assertions(1);

    try {
        validateSemver(leadingV);
    } catch (e) {
        expect(e.message).toBe(
            `the provided value is not a valid semver format. The value provided was: ${leadingV}`,
        );
    }
});

/* Legal values tests */
test('should fail validation if value does not exist in single legal value', () => {
    const value = '500';
    expect.assertions(1);

    try {
        validateLegalValues(legalValues, value);
    } catch (error) {
        expect(error.message).toBe(
            `${value} is not specified as a legal value on this context field`,
        );
    }
});

test('should pass validation if value exists in single legal value', () => {
    const value = '100';
    expect.assertions(0);

    try {
        validateLegalValues(legalValues, value);
    } catch (error) {
        expect(error.message).toBe(
            `${value} is not specified as a legal value on this context field`,
        );
    }
});

test('should fail validation if one of the values does not exist in multiple legal values', () => {
    const values = ['500', '100'];
    expect.assertions(1);

    try {
        validateLegalValues(legalValues, values);
    } catch (error) {
        expect(error.message).toBe(
            `input values are not specified as a legal value on this context field`,
        );
    }
});

test('should pass validation if all of the values exists in legal values', () => {
    const values = ['200', '100'];
    expect.assertions(0);

    try {
        validateLegalValues(legalValues, values);
    } catch (error) {
        expect(error.message).toBe(
            `input values are not specified as a legal value on this context field`,
        );
    }
});
