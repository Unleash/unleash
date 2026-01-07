import { validateSchema } from '../validate.js';
import type { UsersSearchSchema } from './users-search-schema.js';

test('usersSchema', () => {
    const data: UsersSearchSchema = [{ id: 1 }];

    expect(
        validateSchema('#/components/schemas/usersSearchSchema', data),
    ).toBeUndefined();
});
