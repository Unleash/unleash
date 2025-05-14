import { validateSchema } from '../validate.js';
import type { EmailSchema } from './email-schema.js';

test('emailSchema', () => {
    const data: EmailSchema = {
        email: '',
    };

    expect(
        validateSchema('#/components/schemas/emailSchema', data),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/emailSchema', {}),
    ).toMatchSnapshot();
});
