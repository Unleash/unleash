import { validateSchema } from '../validate.js';
import type { RoleSchema } from './role-schema.js';

test('roleSchema', () => {
    const data: RoleSchema = {
        id: 1,
        description: '',
        name: '',
        type: '',
    };

    expect(
        validateSchema('#/components/schemas/roleSchema', data),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/roleSchema', {}),
    ).toMatchSnapshot();
});
