import { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema';

export const playgroundRequestSchema = {
    $id: '#/components/schemas/playgroundRequestSchema',
    description: 'Data for the playground API to evaluate toggles',
    type: 'object',
    required: ['environment', 'context'],
    properties: {
        environment: { type: 'string' },
        projects: {
            oneOf: [
                { type: 'array', items: { type: 'string' } },
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
