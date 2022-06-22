import { validateSchema } from '../validate';
import { RoleSchema } from './role-schema';

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
