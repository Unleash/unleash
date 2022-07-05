import { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema';

export const playgroundRequestSchema = {
    $id: '#/components/schemas/playgroundRequestSchema',
    description: 'Data for the playground API to evaluate toggles',
    type: 'object',
    required: ['environment', 'context'],
    properties: {
        environment: { type: 'string', example: 'development' },
        projects: {
            oneOf: [
                {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['my-project', 'my-other-project'],
                    summary: 'A list of projects to check for toggles in.',
                },
                {
                    type: 'string',
                    enum: ['ALL'],
                    summary: 'Check toggles in all projects.',
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
