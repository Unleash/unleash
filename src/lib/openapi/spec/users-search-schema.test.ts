import { validateSchema } from '../validate';
import type { UsersSearchSchema } from './users-search-schema';

test('usersSchema', () => {
    const data: UsersSearchSchema = [{ id: 1 }];

    expect(
        validateSchema('#/components/schemas/usersSearchSchema', data),
    ).toBeUndefined();
});
