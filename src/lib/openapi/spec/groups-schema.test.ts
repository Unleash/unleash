import { validateSchema } from '../validate.js';
import type { GroupsSchema } from './groups-schema.js';

test('groupsSchema', () => {
    const data: GroupsSchema = {
        groups: [
            {
                id: 1,
                name: 'Group',
                users: [
                    {
                        user: {
                            id: 3,
                        },
                    },
                ],
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/groupsSchema', data),
    ).toBeUndefined();
});
