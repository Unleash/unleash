import { validateSchema } from '../validate.js';
import type { FeatureStrategiesSchema } from './feature-strategies-schema.js';

test('featureStrategiesSchema', () => {
    const data: FeatureStrategiesSchema = [
        {
            id: 'e2caa08f-30c4-4aa3-b955-54ca9e93dc13',
            name: 'default',
            title: 'Default strategy',
            disabled: false,
            parameters: {},
            constraints: [],
            segments: [1, 2],
        },
    ];

    expect(
        validateSchema('#/components/schemas/featureStrategiesSchema', data),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/featureStrategiesSchema', []),
    ).toBeUndefined();
});
