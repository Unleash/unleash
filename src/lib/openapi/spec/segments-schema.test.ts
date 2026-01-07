import { validateSchema } from '../validate.js';
import type { SegmentsSchema } from './segments-schema.js';

test('updateEnvironmentSchema', () => {
    const data: SegmentsSchema = {
        segments: [],
    };

    expect(
        validateSchema('#/components/schemas/segmentsSchema', data),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/segmentsSchema', {
            segments: [],
            additional: 'property',
        }),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/segmentsSchema', {}),
    ).toMatchSnapshot();

    expect(
        validateSchema('#/components/schemas/segmentsSchema', 'not an object'),
    ).toMatchSnapshot();
});
