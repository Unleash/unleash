import { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema';
import { playgroundRequestSchema } from './playground-request-schema';
import { playgroundFeatureSchema } from './playground-feature-schema';

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
                $ref: playgroundFeatureSchema.$id,
            },
        },
    },
    components: {
        schemas: {
            sdkContextSchema,
            playgroundRequestSchema,
            playgroundFeatureSchema,
        },
    },
} as const;

export type PlaygroundResponseSchema = FromSchema<
    typeof playgroundResponseSchema
>;
