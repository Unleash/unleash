/// Adapted from https://github.com/dekatron/joi-html-input

import joi from 'joi';
import sanitizeHtml from 'sanitize-html';

type HtmlInputOptions = sanitizeHtml.IOptions;

// joi.extend() binds root state into the extension's base schema, so a shared
// extension object can only be extended once per process. Export a factory so
// every consumer extends a fresh copy.
const htmlInputExtension = (): joi.Extension => ({
    type: 'htmlInput',
    base: joi.string(),
    messages: {
        'htmlInput.invalidTags': '{{#label}} input must not contain html tags',
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
                const sanitized = sanitizeHtml(value, args.options);
                if (sanitized !== value) {
                    return helpers.error('htmlInput.invalidTags');
                }
                return value;
            },
        },
    },
});

export default htmlInputExtension;
