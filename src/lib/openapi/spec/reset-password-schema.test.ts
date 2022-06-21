import { validateSchema } from '../validate';
import { ResetPasswordSchema } from './reset-password-schema';

test('resetPasswordSchema', () => {
    const data: ResetPasswordSchema = {
        email: '',
    };

    expect(
        validateSchema('#/components/schemas/resetPasswordSchema', data),
    ).toBeUndefined();
});

test('resetPasswordSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/resetPasswordSchema', {}),
    ).toMatchSnapshot();
});
