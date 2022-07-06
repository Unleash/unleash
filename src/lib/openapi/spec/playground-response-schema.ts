import { FromSchema } from 'json-schema-to-ts';
import { sdkContextSchema } from './sdk-context-schema';
import { playgroundRequestSchema } from './playground-request-schema';
import { playgroundFeatureSchema } from './playground-feature-schema';

export const playgroundResponseSchema = {
    $id: '#/components/schemas/playgroundResponseSchema',
    description: 'The state of all toggles given the provided input.',
    type: 'object',
    additionalProperties: false,
    required: ['toggles', 'input'],
    properties: {
        input: {
            $ref: playgroundRequestSchema.$id,
        },
        toggles: {
            type: 'array',
            items: {
                // ref: playgroundFeatureSchema.$id
                type: 'object',
                // ref
                additionalProperties: false,
                required: ['name', 'projectId', 'isEnabled', 'variant'],
                properties: {
                    name: { type: 'string', examples: ['my-feature'] },
                    projectId: { type: 'string', examples: ['my-project'] },
                    isEnabled: { type: 'boolean', examples: [true] },
                    variant: {
                        type: 'string',
                        nullable: true,
                        examples: ['green'],
                    },
                },
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
