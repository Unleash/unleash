import { validateSchema } from '../validate';
import { ProfileSchema } from './profile-schema';
import { RoleName } from '../../types/model';

test('profileSchema', () => {
    const data: ProfileSchema = {
        rootRole: RoleName.EDITOR,
        projects: ['default', 'secretproject'],
        features: [
            { name: 'firstFeature', project: 'default' },
            { name: 'secondFeature', project: 'secretproject' },
        ],
    };

    expect(
        validateSchema('#/components/schemas/profileSchema', data),
    ).toBeUndefined();
});
