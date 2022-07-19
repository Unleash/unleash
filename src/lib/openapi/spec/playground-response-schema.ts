import { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema';
import { playgroundRequestSchema } from './playground-request-schema';
import { playgroundFeatureSchema } from './playground-feature-schema';
import { featureVariantsSchema } from './feature-variants-schema';

export const playgroundResponseSchema = {
    $id: '#/components/schemas/playgroundResponseSchema',
    description: 'The state of all features given the provided input.',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'input'],
    properties: {
        input: {
            $ref: playgroundRequestSchema.$id,
        },
        features: {
            type: 'array',
            items: {
                allOf: [
                    { $ref: playgroundFeatureSchema.$id },
                    {
                        type: 'object',
                        required: ['variants'],
                        properties: {
                            variants: {
                                type: 'array',
                                items: {
                                    $ref: featureVariantsSchema.$id,
                                },
                            },
                        },
                    },
                ],
            },
        },
    },
    components: {
        schemas: {
            featureVariantsSchema,
            playgroundFeatureSchema,
            playgroundRequestSchema,
            sdkContextSchema,
        },
    },
} as const;

export type PlaygroundResponseSchema = FromSchema<
    typeof playgroundResponseSchema
>;
