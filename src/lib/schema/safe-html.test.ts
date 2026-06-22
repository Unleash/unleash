import Joibase from 'joi';
import htmlInput from './safe-html.js';

const joi = Joibase.extend(htmlInput);

describe('joi.htmlInput', () => {
    describe('joi.htmlInput.allowedTags', () => {
        const sanitizeConfig = {
            allowedTags: ['p', 'span'],
            allowedAttributes: {
                span: ['style'],
            },
        };

        it('should not strip allowed tags', () => {
            const htmlString = '<p>This is a <span>string</span></p>';
            const joiSchema = joi.htmlInput().allowedTags(sanitizeConfig);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should strip any other tags', () => {
            const dirtyHtmlString =
                "<div><p>This is <span>bad</span><script>alert('hiya')</script></p></div>";
            const joiSchema = joi.htmlInput().allowedTags(sanitizeConfig);
            const joiValidation = joiSchema.validate(dirtyHtmlString);
            const cleanHtmlString = '<p>This is <span>bad</span></p>';

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(cleanHtmlString);
        });

        it('should not strip allowed attributes', () => {
            const htmlString =
                '<p>This is a <span style="color:red">string</span></p>';
            const joiSchema = joi.htmlInput().allowedTags(sanitizeConfig);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should strip any other attributes', () => {
            const dirtyHtmlString =
                '<p id="test">This is a <span class="italic" style="color:red">string</span></p>';
            const joiSchema = joi.htmlInput().allowedTags(sanitizeConfig);
            const joiValidation = joiSchema.validate(dirtyHtmlString);
            const cleanHtmlString =
                '<p>This is a <span style="color:red">string</span></p>';

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(cleanHtmlString);
        });

        it('should strip tags based on defaults if no parameters are provided', () => {
            const htmlString =
                "<p>This is a <span>string</span><script>alert('test')</script></p>";
            const joiSchema = joi.htmlInput().allowedTags();
            const joiValidation = joiSchema.validate(htmlString);
            const cleanHtmlString = '<p>This is a <span>string</span></p>';

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(cleanHtmlString);
        });
        it('Should not allow svg', () => {
            const htmlString = '<svg/onload=prompt(1)>';
            const joiSchema = joi.htmlInput().allowedTags();
            const joiValidation = joiSchema.validate(htmlString);
            expect(joiValidation.error).not.toBe(null);
        });
        it('Should still allow emoticons as input', () => {
            const htmlString = '🧦🧦';
            const joiSchema = joi.htmlInput().allowedTags();
            const joiValidation = joiSchema.validate(htmlString);
            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });
    });

    describe('joi.htmlInput.displayLength', () => {
        it('should accept strings matching the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayLength(22);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should reject strings that are less than the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayLength(23);
            const joiValidation = joiSchema.validate(htmlString);
            const joiErrorMsg = '"value" length must be 23 characters long';

            expect(joiValidation.error).not.toBe(null);
            expect(joiValidation.error.details.pop().message).toBe(joiErrorMsg);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should reject strings that are greater than the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayLength(21);
            const joiValidation = joiSchema.validate(htmlString);
            const joiErrorMsg = '"value" length must be 21 characters long';

            expect(joiValidation.error).not.toBe(null);
            expect(joiValidation.error.details.pop().message).toBe(joiErrorMsg);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should account for html entities', () => {
            const htmlString =
                '<p>This&nbsp;is&nbsp;an&nbsp;<span style="color:red">html&nbsp;string</span></p>';
            const joiSchema = joi.htmlInput().displayLength(22);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should enforce a limit using byte count', () => {
            const htmlString = '<p>Test \u00A9</p>';
            const joiSchema = joi.htmlInput().displayLength(7, 'utf8');
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });
    });

    describe('joi.htmlInput.displayMin', () => {
        it('should accept strings matching the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayMin(22);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should reject strings that are less than the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayMin(23);
            const joiValidation = joiSchema.validate(htmlString);
            const joiErrorMsg =
                '"value" length must be at least 23 characters long';

            expect(joiValidation.error).not.toBe(null);
            expect(joiValidation.error.details.pop().message).toBe(joiErrorMsg);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should accept strings that are greater than the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayMin(21);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should account for html entities', () => {
            const htmlString =
                '<p>This&nbsp;is&nbsp;an&nbsp;<span style="color:red">html&nbsp;string</span></p>';
            const joiSchema = joi.htmlInput().displayMin(23);
            const joiValidation = joiSchema.validate(htmlString);
            const joiErrorMsg =
                '"value" length must be at least 23 characters long';

            expect(joiValidation.error).not.toBe(null);
            expect(joiValidation.error.details.pop().message).toBe(joiErrorMsg);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should enforce a minimum using byte count', () => {
            const htmlString = '<p>Test \u00A9</p>';
            const joiSchema = joi.htmlInput().displayMin(8, 'utf8');
            const joiValidation = joiSchema.validate(htmlString);
            const joiErrorMsg =
                '"value" length must be at least 8 characters long';

            expect(joiValidation.error).not.toBe(null);
            expect(joiValidation.error.details.pop().message).toBe(joiErrorMsg);
            expect(joiValidation.value).toBe(htmlString);
        });
    });

    describe('joi.htmlInput.displayMax', () => {
        it('should accept strings matching the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayMax(22);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should accept strings that are less than the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayMax(23);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should reject strings that are greater than the desired length', () => {
            const htmlString =
                '<p>This is an <span style="color:red">html string</span></p>';
            const joiSchema = joi.htmlInput().displayMax(21);
            const joiValidation = joiSchema.validate(htmlString);
            const joiErrorMsg =
                '"value" length must be less than or equal to 21 characters long';

            expect(joiValidation.error).not.toBe(null);
            expect(joiValidation.error.details.pop().message).toBe(joiErrorMsg);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should account for html entities', () => {
            const htmlString =
                '<p>This&nbsp;is&nbsp;an&nbsp;<span style="color:red">html&nbsp;string</span></p>';
            const joiSchema = joi.htmlInput().displayMax(22);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should enforce a maximum using byte count', () => {
            const htmlString = '<p>Test \u00A9</p>';
            const joiSchema = joi.htmlInput().displayLength(7, 'utf8');
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });
    });
});
