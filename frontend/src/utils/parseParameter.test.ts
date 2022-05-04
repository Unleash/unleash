import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from 'utils/parseParameter';

test('parseParameterNumber', () => {
    expect(parseParameterNumber(undefined)).toEqual(0);
    expect(parseParameterNumber('')).toEqual(0);
    expect(parseParameterNumber(0)).toEqual(0);
    expect(parseParameterNumber(1)).toEqual(1);
    expect(parseParameterNumber('a')).toEqual(0);
    expect(parseParameterNumber('0')).toEqual(0);
    expect(parseParameterNumber('1')).toEqual(1);
});

test('parseParameterString', () => {
    expect(parseParameterString(undefined)).toEqual('');
    expect(parseParameterString('')).toEqual('');
    expect(parseParameterString(0)).toEqual('0');
    expect(parseParameterString(1)).toEqual('1');
    expect(parseParameterString('a')).toEqual('a');
    expect(parseParameterString('0')).toEqual('0');
    expect(parseParameterString('1')).toEqual('1');
    expect(parseParameterString(' a, ,a ')).toEqual('a, ,a');
});

test('parseParameterStrings', () => {
    expect(parseParameterStrings(undefined)).toEqual([]);
    expect(parseParameterStrings('')).toEqual([]);
    expect(parseParameterStrings(0)).toEqual(['0']);
    expect(parseParameterStrings(1)).toEqual(['1']);
    expect(parseParameterStrings('a')).toEqual(['a']);
    expect(parseParameterStrings('a,b,c')).toEqual(['a', 'b', 'c']);
    expect(parseParameterStrings(' a,, b c ,,, d,')).toEqual(['a', 'b c', 'd']);
});
