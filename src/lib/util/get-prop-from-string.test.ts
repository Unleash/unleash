import { getPropFromString } from './get-prop-from-string';

describe('Nested property extraction', () => {
    it('Empty path returns undefined', () => {
        const obj = { a: 5 };

        const result = getPropFromString('', obj);

        expect(result).toBeUndefined();
    });

    it('Accepts whitespace as property names', () => {
        const obj = { ' ': { ' ': { a: 5 } } };

        const result = getPropFromString(' . .a', obj);

        expect(result).toBe(5);
    });

    it('Invalid top-level properties return undefined', () => {
        const obj = { a: 5 };

        const result = getPropFromString('b', obj);

        expect(result).toBeUndefined();
    });

    it('Invalid nested properties return undefined', () => {
        const obj = { a: 5 };

        const result = getPropFromString('b.c.d', obj);

        expect(result).toBeUndefined();
    });

    it('Gets first-level props', () => {
        const obj = { a: 6 };

        const result = getPropFromString('a', obj);

        expect(result).toBe(obj.a);
    });

    it('Gets nested props', () => {
        const obj = { a: { b: { c: { d: 7 } } } };

        const result = getPropFromString('a.b.c.d', obj);

        expect(result).toBe(obj.a.b.c.d);
    });
});
