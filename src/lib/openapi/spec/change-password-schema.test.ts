import { validateSchema } from '../validate';
import { ChangePasswordSchema } from './change-password-schema';

test('changePasswordSchema', () => {
    const data: ChangePasswordSchema = {
        token: '',
        password: '',
    };

    expect(
        validateSchema('#/components/schemas/changePasswordSchema', data),
    ).toBeUndefined();
});

test('changePasswordSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/changePasswordSchema', {}),
    ).toMatchSnapshot();
});
