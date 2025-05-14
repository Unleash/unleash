import { validateSchema } from '../validate.js';
import type { TagTypesSchema } from './tag-types-schema.js';

test('tagTypesSchema', () => {
    const data: TagTypesSchema = {
        version: 1,
        tagTypes: [
            {
                name: 'simple',
                description: 'Used to simplify filtering of features',
                icon: '#',
                color: '#FF0000',
            },
            {
                name: 'hashtag',
                description: '',
                icon: null,
                color: null,
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
