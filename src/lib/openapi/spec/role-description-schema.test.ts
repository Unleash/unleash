import { validateSchema } from '../validate';
import { RoleDescriptionSchema } from './role-description-schema';

test('roleDescriptionSchema', () => {
    const data: RoleDescriptionSchema = {
        description: '',
        name: '',
        type: '',
    };

    expect(
        validateSchema('#/components/schemas/roleDescriptionSchema', data),
    ).toBeUndefined();
});

test('roleDescriptionSchema empty', () => {
    expect(
        validateSchema('#/components/schemas/roleDescriptionSchema', {}),
    ).toMatchSnapshot();
});
