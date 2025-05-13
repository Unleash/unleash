import { validateSchema } from '../validate.js';
import type { UsersGroupsBaseSchema } from './users-groups-base-schema.js';

test('usersGroupsBaseSchema', () => {
    const data: UsersGroupsBaseSchema = {
        users: [
            {
                id: 1,
            },
        ],
    };
    expect(
        validateSchema('#/components/schemas/usersGroupsBaseSchema', data),
    ).toBeUndefined();
});
