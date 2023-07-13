import { FromSchema } from 'json-schema-to-ts';

export const createStrategyVariantSchema = {
    $id: '#/components/schemas/createStrategyVariantSchema',
    type: 'object',
    additionalProperties: true,
    description:
        '[WIP] A strategy variant allows to attach any data to strategies instead of only returning `true`/`false`. Strategy variants take precedence over feature variants.',
    required: ['name', 'weight', 'weightType', 'stickiness'],
    properties: {
        name: {
            type: 'string',
            description: 'The variants name. Is unique for this feature toggle',
            example: 'blue_group',
        },
        weight: {
            type: 'number',
            description:
                'The weight is the likelihood of any one user getting this variant. It is a number between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/reference/feature-toggle-variants#variant-weight) for more information',
            minimum: 0,
            maximum: 1000,
        },
        weightType: {
            description:
                'Set to fix if this variant must have exactly the weight allocated to it. If the type is variable, the weight will adjust so that the total weight of all variants adds up to 1000',
            type: 'string',
            example: 'fix',
        },
        stickiness: {
            type: 'string',
            description:
                '[Stickiness](https://docs.getunleash.io/reference/feature-toggle-variants#variant-stickiness) is how Unleash guarantees that the same user gets the same variant every time',
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
