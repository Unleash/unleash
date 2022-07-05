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
                    example: ['project-a', 'project-b'],
                },
                { type: 'string', pattern: 'ALL' },
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
