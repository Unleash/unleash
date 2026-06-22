import joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const displayString: (string) => string = (input) => {
    const sanitizeConfig = {
        allowedTags: [],
        allowedAttributes: {},
    };
    return sanitizeHtml(input, sanitizeConfig);
};
type HtmlInputOptions = sanitizeHtml.IOptions;

const htmlInputExtension: joi.Extension = {
    type: 'htmlInput',
    base: joi.string(),
    messages: {
        'htmlInput.displayLength':
            '{{#label}} length must be {{#expectedLength}} characters long',
        'htmlInput.displayMin':
            '{{#label}} length must be at least {{#minLength}} characters long',
        'htmlInput.displayMax':
            '{{#label}} length must be less than or equal to {{#maxLength}} characters long',
    },
    rules: {
        allowedTags: {
            method(options: HtmlInputOptions) {
                return this.$_addRule({
                    name: 'allowedTags',
                    args: { options },
                });
            },
            args: [
                {
                    name: 'options',
                    assert: joi.object().keys({
                        allowedTags: joi.array().items(joi.string()),
                        allowedAttributes: joi.object(),
                    }),
                },
            ],
            validate(value, helpers, args) {
                return sanitizeHtml(value, args.options);
            },
        },
        displayLength: {
            method(expectedLength, encoding) {
                return this.$_addRule({
                    name: 'displayLength',
                    args: { expectedLength, encoding },
                });
            },
            args: [
                {
                    name: 'expectedLength',
                    assert: joi.number().positive().required(),
                },
                {
                    name: 'encoding',
                    assert: joi.string().valid('utf8'),
                },
            ],
            validate(value, helpers, args) {
                const decodedString = displayString(value);
                const joiSchema = joi
                    .string()
                    .length(args.expectedLength, args.encoding);
                const result = joiSchema.validate(decodedString);
                if (result.error) {
                    return helpers.error('htmlInput.displayLength', {
                        expectedLength: args.expectedLength,
                    });
                }
                return value;
            },
        },
        displayMin: {
            method(minLength, encoding) {
                return this.$_addRule({
                    name: 'displayMin',
                    args: { minLength, encoding },
                });
            },
            args: [
                {
                    name: 'minLength',
                    assert: joi.number().positive().required(),
                },
                {
                    name: 'encoding',
                    assert: joi.string().valid('utf8'),
                },
            ],
            validate(value, helpers, args) {
                const decodedString = displayString(value);
                const joiSchema = joi
                    .string()
                    .min(args.minLength, args.encoding);
                const result = joiSchema.validate(decodedString);
                if (result.error) {
                    return helpers.error('htmlInput.displayMin', {
                        minLength: args.minLength,
                    });
                }
                return value;
            },
        },
        displayMax: {
            method(maxLength, encoding) {
                return this.$_addRule({
                    name: 'displayMax',
                    args: { maxLength, encoding },
                });
            },
            args: [
                {
                    name: 'maxLength',
                    assert: joi.number().positive().required(),
                },
                {
                    name: 'encoding',
                    assert: joi.string().valid('utf8'),
                },
            ],
            validate(value, helpers, args) {
                const decodedString = displayString(value);
                const joiSchema = joi
                    .string()
                    .max(args.maxLength, args.encoding);
                const result = joiSchema.validate(decodedString);
                if (result.error) {
                    return helpers.error('htmlInput.displayMax', {
                        maxLength: args.maxLength,
                    });
                }
                return value;
            },
        },
    },
};

export default htmlInputExtension;
