import type { FromSchema } from 'json-schema-to-ts';
import { playgroundConstraintSchema } from './playground-constraint-schema.js';

export const playgroundSegmentSchema = {
    $id: '#/components/schemas/playgroundSegmentSchema',
    type: 'object',
    additionalProperties: false,
    description: 'The evaluated result of a segment as used by the Playground.',
    required: ['name', 'id', 'constraints', 'result'],
    properties: {
        id: {
            description: "The segment's id.",
            type: 'integer',
        },
        name: {
            description: 'The name of the segment.',
            example: 'segment A',
            type: 'string',
        },
        result: {
            description: 'Whether this was evaluated as true or false.',
            type: 'boolean',
        },
        constraints: {
            type: 'array',
            description: 'The list of constraints in this segment.',
            items: { $ref: playgroundConstraintSchema.$id },
        },
    },
    components: {
        schemas: {
            playgroundConstraintSchema,
        },
    },
} as const;

export type PlaygroundSegmentSchema = FromSchema<
    typeof playgroundSegmentSchema,
    { keepDefaultedPropertiesOptional: true }
>;
