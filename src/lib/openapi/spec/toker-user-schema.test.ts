import { validateSchema } from '../validate';
import { TokenUserSchema } from './toker-user-schema';

test('tokenUserSchema', () => {
    const data: TokenUserSchema = {
        createdBy: '',
        token: '',
        role: {
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
