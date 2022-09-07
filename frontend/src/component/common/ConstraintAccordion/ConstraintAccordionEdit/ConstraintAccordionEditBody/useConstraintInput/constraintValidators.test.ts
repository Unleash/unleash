import {
    numberValidatorGenerator,
    semVerValidatorGenerator,
    dateValidatorGenerator,
    stringValidatorGenerator,
} from './constraintValidators';

test('numbervalidator should accept 0', () => {
    const numValidator = numberValidatorGenerator(0);
    const [result, err] = numValidator();

    expect(result).toBe(true);
    expect(err).toBe('');
});

test('number validator should reject value that cannot be parsed to number', () => {
    const numValidator = numberValidatorGenerator('testa31');
    const [result, err] = numValidator();

    expect(result).toBe(false);
    expect(err).toBe('Value must be a number');
});

test('number validator should reject NaN', () => {
    const numValidator = numberValidatorGenerator(NaN);
    const [result, err] = numValidator();

    expect(result).toBe(false);
    expect(err).toBe('Value must be a number');
});

test('number validator should accept value that can be parsed to number', () => {
    const numValidator = numberValidatorGenerator('31');
    const [result, err] = numValidator();

    expect(result).toBe(true);
    expect(err).toBe('');
});

test('number validator should accept float values', () => {
    const numValidator = numberValidatorGenerator('31.12');
    const [result, err] = numValidator();

    expect(result).toBe(true);
    expect(err).toBe('');
});

test('semver validator should reject prefixed values', () => {
    const semVerValidator = semVerValidatorGenerator('v1.4.2');
    const [result, err] = semVerValidator();

    expect(result).toBe(false);
    expect(err).toBe('Value is not a valid semver. For example 1.2.4');
});

test('semver validator should reject partial semver values', () => {
    const semVerValidator = semVerValidatorGenerator('4.2');
    const [result, err] = semVerValidator();

    expect(result).toBe(false);
    expect(err).toBe('Value is not a valid semver. For example 1.2.4');
});

test('semver validator should accept semver complient values', () => {
    const semVerValidator = semVerValidatorGenerator('1.4.2');
    const [result, err] = semVerValidator();

    expect(result).toBe(true);
    expect(err).toBe('');
});

test('date validator should reject invalid date', () => {
    const dateValidator = dateValidatorGenerator('114mydate2005');
    const [result, err] = dateValidator();

    expect(result).toBe(false);
    expect(err).toBe('Value must be a valid date matching RFC3339');
});

test('date validator should accept valid date', () => {
    const dateValidator = dateValidatorGenerator('2022-03-03T10:15:23.262Z');
    const [result, err] = dateValidator();

    expect(result).toBe(true);
    expect(err).toBe('');
});

test('string validator should accept a list of strings', () => {
    const stringValidator = stringValidatorGenerator(['1234', '4121']);
    const [result, err] = stringValidator();

    expect(result).toBe(true);
    expect(err).toBe('');
});

test('string validator should reject values that are not arrays', () => {
    const stringValidator = stringValidatorGenerator(4);
    const [result, err] = stringValidator();

    expect(result).toBe(false);
    expect(err).toBe('Values must be a list of strings');
});

test('string validator should reject arrays that are not arrays of strings', () => {
    const stringValidator = stringValidatorGenerator(['test', NaN, 5]);
    const [result, err] = stringValidator();

    expect(result).toBe(false);
    expect(err).toBe('Values must be a list of strings');
});
