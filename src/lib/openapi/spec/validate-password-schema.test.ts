import { validateSchema } from '../validate';
import { ValidatePasswordSchema } from './validate-password-schema';

test('validatePasswordSchema', () => {
    const data: ValidatePasswordSchema = {
        password: '',
    };

    expect(
        validateSchema('#/components/schemas/validatePasswordSchema', data),
    ).toBeUndefined();
});

test('validatePasswordSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/validatePasswordSchema', {}),
    ).toMatchSnapshot();
});
