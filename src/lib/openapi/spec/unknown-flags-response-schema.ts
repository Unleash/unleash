import type { FromSchema } from 'json-schema-to-ts';
import { unknownFlagSchema } from './unknown-flag-schema.js';

export const unknownFlagsResponseSchema = {
    $id: '#/components/schemas/unknownFlagsResponseSchema',
    type: 'object',
    additionalProperties: false,
    required: ['unknownFlags'],
    description: 'A list of unknown flag reports',
    properties: {
        unknownFlags: {
            description: 'The list of recently reported unknown flags.',
            type: 'array',
            items: { $ref: unknownFlagSchema.$id },
        },
    },
    components: {
        schemas: {
            unknownFlagSchema,
        },
    },
} as const;

export type UnknownFlagsResponseSchema = FromSchema<
    typeof unknownFlagsResponseSchema
>;
