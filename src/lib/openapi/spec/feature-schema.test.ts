import { validateSchema } from '../validate';
import { FeatureSchema } from './feature-schema';

test('featureSchema', () => {
    const data: FeatureSchema = {
        name: 'a',
        strategies: [
            {
                name: 'a',
                constraints: [
                    {
                        contextName: 'a',
                        operator: 'IN',
                    },
                ],
            },
        ],
        variants: [
            {
                name: 'a',
                weight: 1,
                weightType: 'a',
                stickiness: 'a',
                overrides: [{ contextName: 'a', values: ['a'] }],
                payload: { type: 'a', value: 'b' },
            },
        ],
        environments: [
            {
                name: 'a',
                type: 'b',
                enabled: true,
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/featureSchema', data),
    ).toBeUndefined();
});

test('featureSchema constraints', () => {
    const data = {
        name: 'a',
        strategies: [{ name: 'a', constraints: [{ contextName: 'a' }] }],
    };

    expect(
        validateSchema('#/components/schemas/featureSchema', data),
    ).toMatchSnapshot();
});

test('featureSchema overrides', () => {
    const data = {
        name: 'a',
        variants: [
            {
                name: 'a',
                weight: 1,
                weightType: 'a',
                stickiness: 'a',
                overrides: [{ contextName: 'a', values: 'b' }],
                payload: { type: 'a', value: 'b' },
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/featureSchema', data),
    ).toMatchSnapshot();
});
