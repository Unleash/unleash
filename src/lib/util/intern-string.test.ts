import { internString } from './intern-string.js';

test('returns a value equal to the input', () => {
    expect(internString('flexibleRollout')).toBe('flexibleRollout');
});
