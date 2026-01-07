import { validateSchema } from '../validate.js';
import type { UsersSchema } from './users-schema.js';

test('usersSchema', () => {
    const data: UsersSchema = {
        users: [{ id: 1 }],
        rootRoles: [{ id: 1, type: 'a', name: 'b' }],
    };

    expect(
        validateSchema('#/components/schemas/usersSchema', data),
    ).toBeUndefined();
});
