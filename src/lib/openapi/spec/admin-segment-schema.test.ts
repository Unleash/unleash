import { validateSchema } from '../validate.js';
import type { AdminSegmentSchema } from './admin-segment-schema.js';

test('updateEnvironmentSchema', () => {
    const data: AdminSegmentSchema = {
        id: 1,
        name: 'release',
        constraints: [],
        createdAt: '2022-07-25 06:00:00',
        createdBy: 'test',
        description: 'a description',
    };

    expect(
        validateSchema('#/components/schemas/adminSegmentSchema', data),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/adminSegmentSchema', {
            id: 1,
            name: 'release',
            constraints: [],
            createdAt: '2022-07-25 06:00:00',
        }),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/adminSegmentSchema', {
            id: 1,
            name: 'release',
            constraints: [],
            createdAt: '2022-07-25 06:00:00',
            additional: 'property',
        }),
    ).toMatchSnapshot();

    expect(
        validateSchema('#/components/schemas/adminSegmentSchema', {
            id: 1,
            name: 'release',
            constraints: [],
            createdAt: 'wrong-format',
        }),
    ).toMatchSnapshot();

    expect(
        validateSchema('#/components/schemas/adminSegmentSchema', {
            name: 'release',
            constraints: [],
        }),
    ).toMatchSnapshot();

    expect(
        validateSchema(
            '#/components/schemas/adminSegmentSchema',
            'not an object',
        ),
    ).toMatchSnapshot();
});
