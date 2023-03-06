import { validateSchema } from '../validate';
import { TagsBulkAddSchema } from './tags-bulk-add-schema';

test('tagsBulkAddSchema', () => {
    const data: TagsBulkAddSchema = {
        features: ['my-feature'],
        tag: {
            type: 'simple',
            value: 'besttag',
        },
    };

    expect(
        validateSchema('#/components/schemas/tagsBulkAddSchema', data),
    ).toBeUndefined();
});
