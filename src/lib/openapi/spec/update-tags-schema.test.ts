import { validateSchema } from '../validate';
import { UpdateTagsSchema } from './update-tags-schema';

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
