import { expect, test } from 'vitest';
import { isPlainObject, parseJsonObject } from 'utils/plainObject';

test('only key-value objects count as plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject('text')).toBe(false);
    expect(isPlainObject(1)).toBe(false);
});

test('only JSON holding an object parses to one', () => {
    expect(parseJsonObject('{"a": [1]}')).toStrictEqual({ a: [1] });
    expect(parseJsonObject('[{"a": 1}]')).toBeUndefined();
    expect(parseJsonObject('null')).toBeUndefined();
    expect(parseJsonObject('"text"')).toBeUndefined();
    expect(parseJsonObject('{"a": ')).toBeUndefined();
    expect(parseJsonObject('')).toBeUndefined();
});
