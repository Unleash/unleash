import { ensureStringValue } from './ensureStringValue';

test('ensureStringValue', () => {
    expect(ensureStringValue(null)).toEqual('');
    expect(ensureStringValue(undefined)).toEqual('');
    expect(ensureStringValue('null')).toEqual('null');
    expect(ensureStringValue('undefined')).toEqual('undefined');

    expect(ensureStringValue('')).toEqual('');
    expect(ensureStringValue('a')).toEqual('a');
    expect(ensureStringValue(0)).toEqual('0');
    expect(ensureStringValue(true)).toEqual('true');

    expect(ensureStringValue({})).toEqual('{}');
    expect(ensureStringValue({ b: 1 })).toEqual('{"b":1}');
});
