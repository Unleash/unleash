import type { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema.js';

export const playgroundFeatureRequestSchema = {
    $id: '#/components/schemas/playgroundFeatureRequestSchema',
    description:
        'Data for the playground API to evaluate a single feature flag',
    type: 'object',
    required: ['environment', 'context'],
    properties: {
        environment: {
            type: 'string',
            example: 'development',
            description: 'The environment to evaluate the feature flag in.',
        },
        context: {
            $ref: sdkContextSchema.$id,
        },
    },
    components: {
        schemas: {
            sdkContextSchema,
        },
    },
} as const;

export type PlaygroundFeatureRequestSchema = FromSchema<
    typeof playgroundFeatureRequestSchema
>;
