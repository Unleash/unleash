import { FromSchema } from 'json-schema-to-ts';

export const createStrategyVariantSchema = {
    $id: '#/components/schemas/createStrategyVariantSchema',
    type: 'object',
    additionalProperties: true,
    description:
        '[WIP] A strategy variant allows you to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.',
    required: ['name', 'weight', 'weightType', 'stickiness'],
    properties: {
        name: {
            type: 'string',
            description: 'The variant name. Must be unique for this feature toggle',
            example: 'blue_group',
        },
        weight: {
            type: 'integer',
            description:
                'The weight is the likelihood of any one user getting this variant. It is an integer between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight) for more information',
            minimum: 0,
            maximum: 1000,
        },
        weightType: {
            description:
                'Set to `fix` if this variant must have exactly the weight allocated to it. If the type is `variable`, the weight will adjust so that the total weight of all variants adds up to 1000. Refer to the [variant weight documentation](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight).',
            type: 'string',
            example: 'fix',
        },
        stickiness: {
            type: 'string',
            description:
                'The [stickiness](https://docs.getunleash.io/reference/feature-toggle-variants#variant-stickiness) to use for distribution of this variant. Stickiness is how Unleash guarantees that the same user gets the same variant every time',
            example: 'custom.context.field',
        },
        payload: {
            type: 'object',
            required: ['type', 'value'],
            description: 'Extra data configured for this variant',
            properties: {
                type: {
                    type: 'string',
                },
                value: {
                    type: 'string',
                },
            },
            example: { type: 'json', value: '{color: red}' },
        },
    },
    components: {},
} as const;

export type CreateStrategyVariantSchema = FromSchema<
    typeof createStrategyVariantSchema
>;
