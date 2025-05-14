import { validateSchema } from '../validate.js';
import type { TagsBulkAddSchema } from './tags-bulk-add-schema.js';

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
