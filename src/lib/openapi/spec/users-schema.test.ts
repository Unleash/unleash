import { validateSchema } from '../validate';
import { UsersSchema } from './users-schema';

test('usersSchema', () => {
    const data: UsersSchema = {
        users: [{ id: 1 }],
        rootRoles: [{ id: 1, type: 'a', name: 'b' }],
    };

    expect(
        validateSchema('#/components/schemas/usersSchema', data),
    ).toBeUndefined();
});
