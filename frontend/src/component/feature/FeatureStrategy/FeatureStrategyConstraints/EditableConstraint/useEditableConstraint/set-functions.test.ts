import { difference, union } from './set-functions.js';

test('union', () => {
    const a = [1, 2];
    const b = new Set([2, 3]);
    const c = union(a, b);
    expect([...c]).toEqual([1, 2, 3]);
});

test('difference', () => {
    const a = [1, 2];
    const b = new Set([2, 3]);
    const c = difference(a, b);
    expect([...c]).toEqual([1]);
});
