import { tagSchema } from './tag-schema.js';

test('should require url friendly type if defined', () => {
    const tag = {
        value: 'io`dasd',
        type: 'io`dasd',
    };

    const { error } = tagSchema.validate(tag);
    if (error === undefined) {
        fail('Did not receive an expected error');
    }
    expect(error.details[0].message).toEqual('"type" must be URL friendly');
});
