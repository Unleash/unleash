import { createFlagFieldInterner } from './intern-flag-field.js';

test('returns a value equal to the input', () => {
    const internFlagField = createFlagFieldInterner();

    expect(internFlagField('flexibleRollout')).toBe('flexibleRollout');
});
