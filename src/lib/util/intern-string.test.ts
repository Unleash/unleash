import { internString } from './intern-string.js';

test('returns a value equal to the input', () => {
    expect(internString('flexibleRollout')).toBe('flexibleRollout');
});

test('returns the same pooled instance for repeated values', () => {
    const first = internString('release');
    const second = internString('release');

    expect(first).toBe(second);
    expect(first).toBe('release');
});
