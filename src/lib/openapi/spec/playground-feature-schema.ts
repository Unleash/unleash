import { FromSchema } from 'json-schema-to-ts';
import { overrideSchema } from './override-schema';
import { variantSchema } from './variant-schema';

export const playgroundFeatureSchema = {
    $id: '#/components/schemas/playgroundFeatureSchema',
    description:
        'A simplified feature toggle model intended for the Unleash playground.',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'projectId', 'isEnabled', 'variants'],
    properties: {
        name: { type: 'string', examples: ['my-feature'] },
        projectId: { type: 'string', examples: ['my-project'] },
        isEnabled: { type: 'boolean', examples: [true] },
        variants: {
            type: 'array',
            items: {
                allOf: [
                    { $ref: variantSchema.$id },
                    {
                        type: 'object',
                        required: ['enabled'],
                        properties: {
                            enabled: { type: 'boolean', examples: [true] },
                        },
                    },
                ],
            },
        },
    },
    components: { schemas: { variantSchema, overrideSchema } },
} as const;

export type PlaygroundFeatureSchema = FromSchema<
    typeof playgroundFeatureSchema
>;
