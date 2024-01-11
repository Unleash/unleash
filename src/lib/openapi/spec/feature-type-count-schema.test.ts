import { validateSchema } from '../validate';
import { FeatureTypeCountSchema } from './feature-type-count-schema';

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
