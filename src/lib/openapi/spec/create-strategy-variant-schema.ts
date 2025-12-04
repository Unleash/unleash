import type { FromSchema } from 'json-schema-to-ts';

export const createStrategyVariantSchema = {
    $id: '#/components/schemas/createStrategyVariantSchema',
    type: 'object',
    description:
        "This is an experimental property. It may change or be removed as we work on it. Please don't depend on it yet. A strategy variant allows you to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.",
    required: ['name', 'weight', 'weightType', 'stickiness'],
    properties: {
        name: {
            type: 'string',
            description:
                'The variant name. Must be unique for this feature flag',
            example: 'blue_group',
        },
        weight: {
            type: 'integer',
            description:
                'The weight is the likelihood of any one user getting this variant. It is an integer between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/concepts/feature-flag-variants#variant-weight) for more information',
            minimum: 0,
            maximum: 1000,
        },
        weightType: {
            description:
                'Set to `fix` if this variant must have exactly the weight allocated to it. If the type is `variable`, the weight will adjust so that the total weight of all variants adds up to 1000. Refer to the [variant weight documentation](https://docs.getunleash.io/concepts/feature-flag-variants#variant-weight).',
            type: 'string',
            example: 'fix',
            enum: ['variable', 'fix'],
        },
        stickiness: {
            type: 'string',
            description:
                'The [stickiness](https://docs.getunleash.io/concepts/feature-flag-variants#variant-stickiness) to use for distribution of this variant. Stickiness is how Unleash guarantees that the same user gets the same variant every time',
            example: 'custom.context.field',
        },
        payload: {
            type: 'object',
            required: ['type', 'value'],
            description: 'Extra data configured for this variant',
            properties: {
                type: {
                    description:
                        'The type of the value. Commonly used types are string, number, json and csv.',
                    type: 'string',
                    enum: ['json', 'csv', 'string', 'number'],
                },
                value: {
                    description: 'The actual value of payload',
                    type: 'string',
                },
            },
            example: { type: 'json', value: '{"color": "red"}' },
        },
    },
    components: {},
} as const;

export type CreateStrategyVariantSchema = FromSchema<
    typeof createStrategyVariantSchema
>;
