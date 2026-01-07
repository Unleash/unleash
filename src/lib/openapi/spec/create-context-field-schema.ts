import type { FromSchema } from 'json-schema-to-ts';
import { updateContextFieldSchema } from './update-context-field-schema.js';

export const createContextFieldSchema = {
    ...updateContextFieldSchema,
    $id: '#/components/schemas/createContextFieldSchema',
    description: 'Data used to create a context field configuration.',
    required: ['name'],
    properties: {
        ...updateContextFieldSchema.properties,
        name: {
            description: 'The name of the context field.',
            type: 'string',
            example: 'subscriptionTier',
        },
    },
} as const;

export type CreateContextFieldSchema = FromSchema<
    typeof createContextFieldSchema
>;
