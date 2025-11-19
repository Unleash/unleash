import {
    parsePositiveInteger,
    parsePositiveDecimal,
    isValidPositiveInteger,
    isValidPositiveDecimal,
} from 'utils/numericInputParser';

test('parsePositiveInteger', () => {
    expect(parsePositiveInteger('')).toEqual(0);
    expect(parsePositiveInteger('123')).toEqual(123);
    expect(parsePositiveInteger('1.5')).toEqual(0);
    expect(parsePositiveInteger('abc')).toEqual(0);
});

test('parsePositiveDecimal', () => {
    expect(parsePositiveDecimal('')).toEqual(0);
    expect(parsePositiveDecimal('123.45')).toEqual(123.45);
    expect(parsePositiveDecimal('.5')).toEqual(0.5);
    expect(parsePositiveDecimal('abc')).toEqual(0);
});

test('isValidPositiveInteger', () => {
    expect(isValidPositiveInteger('')).toEqual(true);
    expect(isValidPositiveInteger('123')).toEqual(true);
    expect(isValidPositiveInteger('1.5')).toEqual(false);
    expect(isValidPositiveInteger('abc')).toEqual(false);
});

test('isValidPositiveDecimal', () => {
    expect(isValidPositiveDecimal('')).toEqual(true);
    expect(isValidPositiveDecimal('123.45')).toEqual(true);
    expect(isValidPositiveDecimal('.5')).toEqual(true);
    expect(isValidPositiveDecimal('abc')).toEqual(false);
});
