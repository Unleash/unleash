import { validateSchema } from '../validate.js';

test('upsertSegmentSchema', () => {
    const validObjects = [
        {
            name: 'segment',
            constraints: [],
        },
        {
            name: 'segment',
            description: 'description',
            constraints: [],
        },
        {
            name: 'segment',
            description: 'description',
            constraints: [],
            additional: 'property',
        },
    ];

    validObjects.forEach((obj) => {
        expect(
            validateSchema('#/components/schemas/upsertSegmentSchema', obj),
        ).toBeUndefined();
    });

    const invalidObjects = [
        {
            name: 'segment',
        },
        {
            description: 'description',
            constraints: [],
        },
        {},
    ];

    invalidObjects.forEach((obj) => {
        expect(
            validateSchema('#/components/schemas/upsertSegmentSchema', obj),
        ).toMatchSnapshot();
    });
});
