import { validateSchema } from '../validate.js';
import type { UpdateTagsSchema } from './update-tags-schema.js';

test('updateTagsSchema', () => {
    const data: UpdateTagsSchema = {
        addedTags: [
            {
                type: 'simple',
                value: 'besttag',
            },
        ],
        removedTags: [
            {
                type: 'simple2',
                value: 'besttag2',
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/updateTagsSchema', data),
    ).toBeUndefined();
});
