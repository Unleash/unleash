import { TAG_MAX_LENGTH, TAG_MIN_LENGTH } from '../../tags/index.js';
import { validateSchema } from '../validate.js';

describe('tag value validation', () => {
    test.each([
        ['minimum', TAG_MIN_LENGTH],
        ['maximum', TAG_MAX_LENGTH],
    ])(`names with the %s length are valid`, (_, length) => {
        const data = {
            value: 'a'.repeat(length),
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/createTagSchema',
            data,
        );

        expect(validationResult).toBeUndefined();
    });

    test(`names can not be only whitespace`, () => {
        const space = ' '.repeat(TAG_MIN_LENGTH);
        const data = {
            value: space,
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/createTagSchema',
            data,
        );

        expect(validationResult).toMatchObject({
            errors: [{ keyword: 'pattern', instancePath: '/value' }],
        });
    });

    test(`names must be at least ${TAG_MIN_LENGTH} characters long, not counting leading and trailing whitespace`, () => {
        const space = ' '.repeat(TAG_MIN_LENGTH);
        const data = {
            value: space + 'a'.repeat(TAG_MIN_LENGTH - 1) + space,
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/createTagSchema',
            data,
        );

        expect(validationResult).toMatchObject({
            errors: [{ keyword: 'pattern', instancePath: '/value' }],
        });
    });

    test(`spaces within a tag value counts towards its maximum length`, () => {
        const space = ' '.repeat(TAG_MAX_LENGTH);
        const data = {
            value: `a${space}z`,
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/createTagSchema',
            data,
        );

        expect(validationResult).toMatchObject({
            errors: [{ keyword: 'pattern', instancePath: '/value' }],
        });
    });

    test(`leading and trailing whitespace does not count towards a name's maximum length`, () => {
        const space = ' '.repeat(TAG_MAX_LENGTH);
        const data = {
            value: space + 'a'.repeat(TAG_MAX_LENGTH) + space,
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/createTagSchema',
            data,
        );

        expect(validationResult).toBeUndefined();
    });

    test(`tag names can contain spaces`, () => {
        const data = {
            value: 'tag name with spaces',
            type: 'simple',
        };

        const validationResult = validateSchema(
            '#/components/schemas/createTagSchema',
            data,
        );

        expect(validationResult).toBeUndefined();
    });
});
