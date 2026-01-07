import { validateSchema } from '../validate.js';
import type { ConstraintSchema } from './constraint-schema.js';

test('constraintSchema', () => {
    const data: ConstraintSchema = {
        contextName: 'a',
        operator: 'NUM_LTE',
        value: '1',
        caseInsensitive: false,
        inverted: false,
    };

    expect(
        validateSchema('#/components/schemas/constraintSchema', data),
    ).toBeUndefined();
});

test('constraintSchema invalid value type', () => {
    expect(
        validateSchema('#/components/schemas/constraintSchema', {
            contextName: 'a',
            operator: 'NUM_LTE',
            value: 1,
        }),
    ).toMatchSnapshot();
});

test('constraintSchema invalid operator name', () => {
    expect(
        validateSchema('#/components/schemas/constraintSchema', {
            contextName: 'a',
            operator: 'b',
            value: '1',
        }),
    ).toMatchSnapshot();
});
