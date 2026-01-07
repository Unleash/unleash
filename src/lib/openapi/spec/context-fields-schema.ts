import type { FromSchema } from 'json-schema-to-ts';
import { contextFieldSchema } from './context-field-schema.js';
import { legalValueSchema } from './legal-value-schema.js';

export const contextFieldsSchema = {
    $id: '#/components/schemas/contextFieldsSchema',
    type: 'array',
    description: 'A list of context fields',
    items: {
        $ref: '#/components/schemas/contextFieldSchema',
    },
    components: {
        schemas: {
            contextFieldSchema,
            legalValueSchema,
        },
    },
} as const;

export type ContextFieldsSchema = FromSchema<typeof contextFieldsSchema>;
