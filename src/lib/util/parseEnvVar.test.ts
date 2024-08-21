import {
    parseEnvVarBoolean,
    parseEnvVarNumber,
    parseEnvVarStrings,
} from './parseEnvVar';

test('parseEnvVarNumber', () => {
    expect(parseEnvVarNumber('', 1)).toEqual(1);
    expect(parseEnvVarNumber('', 2)).toEqual(2);
    expect(parseEnvVarNumber(' ', 1)).toEqual(1);
    expect(parseEnvVarNumber('a', 1)).toEqual(1);
    expect(parseEnvVarNumber('1', 1)).toEqual(1);
    expect(parseEnvVarNumber('2', 1)).toEqual(2);
    expect(parseEnvVarNumber('2e2', 1)).toEqual(2);
    expect(parseEnvVarNumber('-1', 1)).toEqual(-1);
});

test('parseEnvVarBoolean', () => {
    expect(parseEnvVarBoolean('', true)).toEqual(true);
    expect(parseEnvVarBoolean('', false)).toEqual(false);
    expect(parseEnvVarBoolean(' ', false)).toEqual(false);
    expect(parseEnvVarBoolean('1', false)).toEqual(true);
    expect(parseEnvVarBoolean('2', false)).toEqual(false);
    expect(parseEnvVarBoolean('t', false)).toEqual(true);
    expect(parseEnvVarBoolean('f', false)).toEqual(false);
    expect(parseEnvVarBoolean('true', false)).toEqual(true);
    expect(parseEnvVarBoolean('false', false)).toEqual(false);
    expect(parseEnvVarBoolean('test', false)).toEqual(false);
});

test('parseEnvVarStringList', () => {
    expect(parseEnvVarStrings(undefined, [])).toEqual([]);
    expect(parseEnvVarStrings(undefined, ['a'])).toEqual(['a']);
    expect(parseEnvVarStrings('', ['a'])).toEqual([]);
    expect(parseEnvVarStrings('', [])).toEqual([]);
    expect(parseEnvVarStrings('  ', [])).toEqual([]);
    expect(parseEnvVarStrings('a', ['*'])).toEqual(['a']);
    expect(parseEnvVarStrings('a,b,c', [])).toEqual(['a', 'b', 'c']);
    expect(parseEnvVarStrings('a,b,c', [])).toEqual(['a', 'b', 'c']);
    expect(parseEnvVarStrings(' a,,,b,  c , ,', [])).toEqual(['a', 'b', 'c']);
});

describe('parseEnvVarNumberWithBounds', () => {
    test('prefers options override over default value if present', () => {
        expect(parseEnvVarNumber('', 1, { optionsOverride: 2 })).toEqual(2);
    });

    test('accepts 0 as options override', () => {
        expect(parseEnvVarNumber('', 1, { optionsOverride: 0 })).toEqual(0);
    });

    test('prefers env var over options override', () => {
        expect(parseEnvVarNumber('5', 1, { optionsOverride: 2 })).toEqual(5);
    });

    test('clamps the number to greater than or equal to the min number if provided', () => {
        expect(parseEnvVarNumber('1', 0, { min: 2 })).toEqual(2);
        expect(parseEnvVarNumber('', 0, { min: 2 })).toEqual(2);
        expect(
            parseEnvVarNumber('', 0, { optionsOverride: 1, min: 2 }),
        ).toEqual(2);
    });
});
