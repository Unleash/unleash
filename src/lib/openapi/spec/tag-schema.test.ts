import { TAG_MAX_LENGTH, TAG_MIN_LENGTH } from '../../services/tag-schema';
import { validateSchema } from '../validate';

describe('tag value validation', () => {
    test.each([
        ['minimum', TAG_MIN_LENGTH],
        ['maximum', TAG_MIN_LENGTH],
    ])(`names with the %s length are valid`, (_, length) => {
        const data = {
            value: 'a'.repeat(length),
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/tagSchema',
            data,
        );

        expect(validationResult).toBeUndefined();
    });

    test(`names must be at least ${TAG_MIN_LENGTH} characters long, not counting leading and trailing whitespace`, () => {
        const space = ' '.repeat(TAG_MIN_LENGTH);
        const data = {
            value: space + 'a'.repeat(TAG_MIN_LENGTH - 1) + space,
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/tagSchema',
            data,
        );
        console.log(validationResult);

        expect(validationResult).not.toBeUndefined();
    });

    test(`leading and trailing whitespace does not count towards a name's maximum length`, () => {
        const space = ' '.repeat(TAG_MAX_LENGTH);
        const data = {
            value: space + 'a'.repeat(TAG_MAX_LENGTH) + space,
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/tagSchema',
            data,
        );
        console.log(validationResult);

        expect(validationResult).not.toBeUndefined();
    });
});
