import { validateSchema } from '../validate.js';
import type { ChangePasswordSchema } from './change-password-schema.js';

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
