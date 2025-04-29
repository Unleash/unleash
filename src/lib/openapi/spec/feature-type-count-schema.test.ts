import { validateSchema } from '../validate.js';
import type { FeatureTypeCountSchema } from './feature-type-count-schema.js';

test('featureTypeCountSchema', () => {
    const data: FeatureTypeCountSchema = {
        type: 'release',
        count: 1,
    };

    expect(
        validateSchema('#/components/schemas/featureTypeCountSchema', data),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/featureTypeCountSchema', {}),
    ).toMatchSnapshot();
});
