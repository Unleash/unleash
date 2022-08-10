import { validateSchema } from '../validate';
import { TagTypesSchema } from './tag-types-schema';

test('tagTypesSchema', () => {
    const data: TagTypesSchema = {
        version: 1,
        tagTypes: [
            {
                name: 'simple',
                description: 'Used to simplify filtering of features',
                icon: '#',
            },
            {
                name: 'hashtag',
                description: '',
                icon: null,
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/tagTypesSchema', {}),
    ).not.toBeUndefined();

    expect(
        validateSchema('#/components/schemas/tagTypesSchema', data),
    ).toBeUndefined();
});
