import { validateSchema } from '../validate';
import { ProfileSchema } from './profile-schema';
import { RoleName } from '../../types/model';

test('profileSchema', () => {
    const data: ProfileSchema = {
        rootRole: 'Editor' as RoleName,
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
