import { reorderObject } from './reorderObject.js';

describe('reorderObject', () => {
    it('correctly reorders the object based on provided keys', () => {
        const myObj = { a: 1, b: 2, c: 3, d: 4 };
        const order = ['b', 'a'];
        const result = reorderObject(myObj, order);
        const expected = { b: 2, a: 1, c: 3, d: 4 };
        expect(result).toEqual(expected);
    });

    it('ignores non-existent keys in the order array', () => {
        const myObj = { a: 1, b: 2, c: 3 };
        const order = ['c', 'z', 'a']; // 'z' does not exist in myObj
        const result = reorderObject(myObj, order);
        const expected = { c: 3, a: 1, b: 2 };
        expect(result).toEqual(expected);
    });

    it('returns the original object when order array is empty', () => {
        const myObj = { a: 1, b: 2, c: 3 };
        const order: string[] = [];
        const result = reorderObject(myObj, order);
        expect(result).toEqual(myObj);
    });

    it('returns the object with the same order when order array contains all object keys', () => {
        const myObj = { a: 1, b: 2, c: 3 };
        const order = ['a', 'b', 'c'];
        const result = reorderObject(myObj, order);
        expect(result).toEqual(myObj);
    });

    it('does not modify the original object', () => {
        const myObj = { a: 1, b: 2, c: 3 };
        const order = ['b', 'a'];
        const _result = reorderObject(myObj, order);
        expect(myObj).toEqual({ a: 1, b: 2, c: 3 }); // myObj should remain unchanged
    });
});
