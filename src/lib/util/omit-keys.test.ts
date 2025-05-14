import { omitKeys } from './omit-keys.js';

test('omitKeys', () => {
    expect(omitKeys({ a: 1, b: 2, c: 3 }, 'a', 'b')).toEqual({
        c: 3,
    });
});
