import { validateSchema } from '../validate';
import { TokenUserSchema } from './token-user-schema';

test('tokenUserSchema', () => {
    const data: TokenUserSchema = {
        createdBy: '',
        token: '',
        role: {
            id: 1,
            description: '',
            name: '',
            type: '',
        },
    };

    expect(
        validateSchema('#/components/schemas/tokenUserSchema', data),
    ).toBeUndefined();
});

test('tokenUserSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/tokenUserSchema', {}),
    ).toMatchSnapshot();
});
