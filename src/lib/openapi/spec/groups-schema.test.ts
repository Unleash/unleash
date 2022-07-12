import { validateSchema } from '../validate';
import { GroupsSchema } from './groups-schema';

test('groupsSchema', () => {
    const data: GroupsSchema = {
        groups: [
            {
                id: 1,
                name: 'Group',
                users: [
                    {
                        type: 'Owner',
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
