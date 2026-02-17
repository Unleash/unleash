import type { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema.js';

export const variantSchema = {
    $id: '#/components/schemas/variantSchema',
    type: 'object',
    additionalProperties: false,
    description:
        'A variant allows for further separation of users into segments. See [our excellent documentation](https://docs.getunleash.io/concepts/feature-flag-variants#what-are-variants) for a more detailed description',
    required: ['name', 'weight'],
    properties: {
        name: {
            type: 'string',
            description: 'The variants name. Is unique for this feature flag',
            example: 'blue_group',
        },
        weight: {
            type: 'number',
            description:
                'The weight is the likelihood of any one user getting this variant. It is a number between 0 and 1000. See the section on [variant weights](https://docs.getunleash.io/concepts/feature-flag-variants#variant-weight) for more information',
            minimum: 0,
            maximum: 1000,
        },
        weightType: {
            description:
                'Set to fix if this variant must have exactly the weight allocated to it. If the type is variable, the weight will adjust so that the total weight of all variants adds up to 1000',
            type: 'string',
            example: 'variable',
            enum: ['variable', 'fix'],
        },
        stickiness: {
            type: 'string',
            description:
                '[Stickiness](https://docs.getunleash.io/concepts/feature-flag-variants#variant-stickiness) is how Unleash guarantees that the same user gets the same variant every time',
            example: 'custom.context.field',
        },
        payload: {
            type: 'object',
            required: ['type', 'value'],
            description: 'Extra data configured for this variant',
            additionalProperties: false,
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
        overrides: {
            description: `Overrides assigning specific variants to specific users. The weighting system automatically assigns users to specific groups for you, but any overrides in this list will take precedence.`,
            type: 'array',
            items: {
                $ref: '#/components/schemas/overrideSchema',
            },
        },
        jsonSchemaId: {
            type: 'string',
            description:
                'Optional ID of a project JSON schema to validate this variant payload against.',
            example: '01HXYZ1234567890ABCDEFGHJK',
        },
    },
    components: {
        schemas: {
            overrideSchema,
        },
    },
} as const;

export type VariantSchema = FromSchema<typeof variantSchema>;
