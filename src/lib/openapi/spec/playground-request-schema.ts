import { FromSchema } from 'json-schema-to-ts';
import { ALL } from '../../types/models/api-token';
import { sdkContextSchema } from './sdk-context-schema';

export const playgroundRequestSchema = {
    $id: '#/components/schemas/playgroundRequestSchema',
    description: 'Data for the playground API to evaluate toggles',
    type: 'object',
    required: ['environment', 'context'],
    properties: {
        environment: { type: 'string', examples: ['development'] },
        projects: {
            oneOf: [
                {
                    type: 'array',
                    items: { type: 'string' },
                    examples: ['my-project', 'my-other-project'],
                    description: 'A list of projects to check for toggles in.',
                },
                {
                    type: 'string',
                    enum: [ALL],
                    description: 'Check toggles in all projects.',
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
