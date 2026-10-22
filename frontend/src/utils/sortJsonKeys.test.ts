import { describe, expect, test } from 'vitest';
import { sortJsonKeys } from 'utils/sortJsonKeys';

describe('sortJsonKeys', () => {
    test('sorts object keys alphabetically', () => {
        expect(sortJsonKeys({ b: 1, a: 2, c: 3 })).toEqual({
            a: 2,
            b: 1,
            c: 3,
        });
    });

    test('sorts nested object keys', () => {
        expect(
            sortJsonKeys({
                name: 'John',
                address: { street: 'MG Road', city: 'Bengaluru' },
            }),
        ).toEqual({
            address: { city: 'Bengaluru', street: 'MG Road' },
            name: 'John',
        });
    });

    test('keeps array order and sorts objects inside arrays', () => {
        expect(
            sortJsonKeys({
                skills: [
                    { level: 2, name: 'SQL' },
                    { level: 1, name: 'Python' },
                ],
            }),
        ).toEqual({
            skills: [
                { level: 2, name: 'SQL' },
                { level: 1, name: 'Python' },
            ],
        });

        expect(sortJsonKeys([3, 1, 2])).toEqual([3, 1, 2]);
    });

    test('leaves primitives and null untouched', () => {
        expect(sortJsonKeys('text')).toEqual('text');
        expect(sortJsonKeys(42)).toEqual(42);
        expect(sortJsonKeys(true)).toEqual(true);
        expect(sortJsonKeys(null)).toEqual(null);
        expect(sortJsonKeys(undefined)).toEqual(undefined);
    });

    test('sorts by code unit, independent of locale', () => {
        expect(
            Object.keys(sortJsonKeys({ b: 1, B: 2, a: 3 }) as object),
        ).toEqual(['B', 'a', 'b']);
    });

    test('keeps a __proto__ key instead of changing the prototype', () => {
        const input = JSON.parse('{"b":1,"__proto__":{"a":2}}');

        const result = sortJsonKeys(input) as Record<string, unknown>;

        expect(Object.keys(result)).toEqual(['__proto__', 'b']);
        expect(JSON.stringify(result)).toEqual('{"__proto__":{"a":2},"b":1}');
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    });

    test('does not mutate the input', () => {
        const input = { b: 1, a: { d: 1, c: 2 } };
        const snapshot = JSON.stringify(input);

        sortJsonKeys(input);

        expect(JSON.stringify(input)).toEqual(snapshot);
    });
});
