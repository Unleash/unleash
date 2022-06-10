import { FromSchema } from 'json-schema-to-ts';

export const sortOrderSchema = {
    $id: '#/components/schemas/sortOrderSchema',
    type: 'object',
    additionalProperties: {
        type: 'number',
    },
    components: {},
} as const;

export type SortOrderSchema = FromSchema<typeof sortOrderSchema>;
