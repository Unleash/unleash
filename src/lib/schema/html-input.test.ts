/// Adapted from https://github.com/dekatron/joi-html-input

import Joibase from 'joi';
import htmlInput from './html-input.js';

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

        it('should fail if non allowed tags are used', () => {
            const dirtyHtmlString =
                "<div><p>This is <span>bad</span><script>alert('hiya')</script></p></div>";
            const joiSchema = joi.htmlInput().allowedTags(sanitizeConfig);
            const joiValidation = joiSchema.validate(dirtyHtmlString);

            expect(joiValidation.error).not.toBe(undefined);
        });

        it('should not strip allowed attributes', () => {
            const htmlString =
                '<p>This is a <span style="color:red">string</span></p>';
            const joiSchema = joi.htmlInput().allowedTags(sanitizeConfig);
            const joiValidation = joiSchema.validate(htmlString);

            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });

        it('should fail if disallowed attributes are used', () => {
            const dirtyHtmlString =
                '<p id="test">This is a <span class="italic" style="color:red">string</span></p>';
            const joiSchema = joi.htmlInput().allowedTags(sanitizeConfig);
            const joiValidation = joiSchema.validate(dirtyHtmlString);
            expect(joiValidation.error).not.toBe(undefined);
        });

        it('should fail to parse based on defaults if no parameters are provided', () => {
            const htmlString =
                "<p>This is a <span>string</span><script>alert('test')</script></p>";
            const joiSchema = joi.htmlInput().allowedTags();
            const joiValidation = joiSchema.validate(htmlString);
            expect(joiValidation.error).not.toBe(undefined);
        });
        it('Should not allow svg', () => {
            const htmlString = '<svg/onload=prompt(1)>';
            const joiSchema = joi.htmlInput().allowedTags(sanitizeConfig);
            const joiValidation = joiSchema.validate(htmlString);
            expect(joiValidation.error).not.toBe(undefined);
        });
        it('Should still allow emoticons as input', () => {
            const htmlString = '🧦🧦';
            const joiSchema = joi.htmlInput().allowedTags();
            const joiValidation = joiSchema.validate(htmlString);
            expect(joiValidation.error).toBe(undefined);
            expect(joiValidation.value).toBe(htmlString);
        });
    });
});
