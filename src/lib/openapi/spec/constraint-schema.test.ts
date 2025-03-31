import { validateSchema } from '../validate';
import type { ConstraintSchema } from './constraint-schema';

test('constraintSchema', () => {
    // @ts-expect-error missing required fields caseInsensitive and inverted
    const data: ConstraintSchema = {
        contextName: 'a',
        operator: 'NUM_LTE',
        value: '1',
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
