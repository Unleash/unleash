import type { FromSchema } from 'json-schema-to-ts';

export const sortOrderSchema = {
    $id: '#/components/schemas/sortOrderSchema',
    type: 'object',
    description: 'A map of object IDs and their corresponding sort orders.',
    additionalProperties: {
        type: 'integer',
        description:
            'Sort order for the object whose ID is the key used for this property.',
        example: 6,
    },
    components: {},
} as const;

export type SortOrderSchema = FromSchema<typeof sortOrderSchema>;
