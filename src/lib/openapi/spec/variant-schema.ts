import { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema';

export const variantSchema = {
    $id: '#/components/schemas/variantSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A variant allows for further separation of users into segments. See [our excellent documentation](https://docs.getunleash.io/reference/feature-toggle-variants#what-are-variants) for a more detailed description',
    required: ['name', 'weight'],
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
        overrides: {
            description: `Overrides assigning specific variants to specific users. The weighting system automatically assigns users to specific groups for you, but any overrides in this list will take precedence.`,
            type: 'array',
            items: {
                $ref: '#/components/schemas/overrideSchema',
            },
        },
    },
    components: {
        schemas: {
            overrideSchema,
        },
    },
} as const;

export type VariantSchema = FromSchema<typeof variantSchema>;
