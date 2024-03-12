import { validateSchema } from '../validate';
import type { SegmentsSchema } from './segments-schema';

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
