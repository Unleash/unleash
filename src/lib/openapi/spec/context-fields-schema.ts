import { FromSchema } from 'json-schema-to-ts';
import { contextFieldSchema } from './context-field-schema';
import { legalValueSchema } from './legal-value-schema';

export const contextFieldsSchema = {
    $id: '#/components/schemas/contextFieldsSchema',
    type: 'array',
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
