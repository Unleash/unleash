import { validateSchema } from '../validate.js';
import type { FeatureTypeSchema } from './feature-type-schema.js';

test('featureTypeSchema', () => {
    const data: FeatureTypeSchema = {
        description: '',
        id: '',
        name: '',
        lifetimeDays: 0,
    };

    expect(
        validateSchema('#/components/schemas/featureTypeSchema', data),
    ).toBeUndefined();
});

test('featureTypeSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/featureTypeSchema', {}),
    ).toMatchSnapshot();
});
