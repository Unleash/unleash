import { validateSchema } from '../validate';
import { UserSchema } from './user-schema';

test('userSchema', () => {
    const data: UserSchema = {
        isAPI: false,
        id: 1,
        username: 'admin',
        imageUrl: 'avatar',
        seenAt: '2022-06-27T12:19:15.838Z',
        loginAttempts: 0,
        createdAt: '2022-04-08T10:59:25.072Z',
    };

    expect(
        validateSchema('#/components/schemas/userSchema', {}),
    ).not.toBeUndefined();

    expect(
        validateSchema('#/components/schemas/userSchema', data),
    ).toBeUndefined();
});
