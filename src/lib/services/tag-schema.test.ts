import { tagSchema } from './tag-schema';

test('should require url friendly type if defined', () => {
    const tag = {
        value: 'io`dasd',
        type: 'io`dasd',
    };

    const { error } = tagSchema.validate(tag);
    expect(error.details[0].message).toEqual('"type" must be URL friendly');
});
