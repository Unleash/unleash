import { validateSchema } from '../validate';
import { EnvironmentCreateSchema } from './environment-create-schema';

test('environmentCreateSchema', () => {
    const data: EnvironmentCreateSchema[] = [
        {
            name: 'new-feature-1',
            type: 'release',
        },
        {
            name: 'new-feature-2',
            type: 'release',
            enabled: false,
        },
        {
            name: 'new-feature-3',
            type: 'release',
            sortOrder: 5,
        },
        {
            name: 'new-feature-4',
            type: 'release',
            sortOrder: 7,
            enabled: false,
        },
    ];

    data.forEach((obj) =>
        expect(
            validateSchema('#/components/schemas/environmentCreateSchema', obj),
        ).toBeUndefined(),
    );
});
