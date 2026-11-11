import { escapeLikePattern } from './escape-like.js';

test.each([
    ['plain-prefix', 'plain-prefix'],
    ['', ''],
    ['b_', String.raw`b\_`],
    ['100%', String.raw`100\%`],
    [String.raw`a\b`, String.raw`a\\b`],
    [String.raw`_%\_%`, String.raw`\_\%\\\_\%`],
])('escapes LIKE wildcards in %j', (value, expected) => {
    expect(escapeLikePattern(value)).toBe(expected);
});
