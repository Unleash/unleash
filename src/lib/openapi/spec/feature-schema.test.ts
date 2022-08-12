import { validateSchema } from '../validate';
import { FeatureSchema } from './feature-schema';

test('featureSchema', () => {
    const data: FeatureSchema = {
        name: 'a',
        strategies: [
            {
                id: 'a',
                name: 'a',
                constraints: [
                    {
                        contextName: 'a',
                        operator: 'IN',
                    },
                ],
                segments: [1],
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

test('featureSchema variants should only have a few required fields', () => {
    const data = {
        name: 'a',
        variants: [
            {
                name: 'a',
                weight: 1,
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/featureSchema', data),
    ).toBeUndefined();
});

test('featureSchema variant override values must be an array', () => {
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
