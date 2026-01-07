import type { FromSchema } from 'json-schema-to-ts';
import { ALL } from '../../types/models/api-token.js';
import { sdkContextSchema } from './sdk-context-schema.js';

export const playgroundRequestSchema = {
    $id: '#/components/schemas/playgroundRequestSchema',
    description: 'Data for the playground API to evaluate feature flags',
    type: 'object',
    required: ['environment', 'context'],
    properties: {
        environment: {
            type: 'string',
            example: 'development',
            description: 'The environment to evaluate feature flags in.',
        },
        projects: {
            description: 'A list of projects to check for feature flags in.',
            oneOf: [
                {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['my-project'],
                    description:
                        'A list of projects to check for feature flags in.',
                },
                {
                    type: 'string',
                    enum: [ALL],
                    description: 'Check feature flags in all projects.',
                },
            ],
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

export type PlaygroundRequestSchema = FromSchema<
    typeof playgroundRequestSchema
>;
