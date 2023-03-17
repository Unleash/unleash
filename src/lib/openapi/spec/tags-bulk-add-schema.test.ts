import { validateSchema } from '../validate';
import { TagsBulkAddSchema } from './tags-bulk-add-schema';

test('tagsBulkAddSchema', () => {
    const data: TagsBulkAddSchema = {
        features: ['my-feature'],
        tags: {
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
        },
    };

    expect(
        validateSchema('#/components/schemas/tagsBulkAddSchema', data),
    ).toBeUndefined();
});
