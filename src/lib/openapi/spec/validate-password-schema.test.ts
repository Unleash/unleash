import { validateSchema } from '../validate.js';
import type { ValidatePasswordSchema } from './validate-password-schema.js';

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
