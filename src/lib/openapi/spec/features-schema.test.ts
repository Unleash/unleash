import { validateSchema } from '../validate';
import type { FeaturesSchema } from './features-schema';

test('featuresSchema', () => {
    const data: FeaturesSchema = {
        version: 1,
        features: [],
    };

    expect(
        validateSchema('#/components/schemas/featuresSchema', data),
    ).toBeUndefined();
});
