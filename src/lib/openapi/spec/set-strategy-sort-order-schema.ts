import type { FromSchema } from 'json-schema-to-ts';

export const setStrategySortOrderSchema = {
    $id: '#/components/schemas/setStrategySortOrderSchema',
    type: 'array',
    description: 'An array of strategies with their new sort order',
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'sortOrder'],
        description: 'A strategy with its new sort order',
        properties: {
            id: {
                type: 'string',
                example: '9c40958a-daac-400e-98fb-3bb438567008',
                description: 'The ID of the strategy',
            },
            sortOrder: {
                type: 'number',
                example: 1,
                description: 'The new sort order of the strategy',
            },
        },
    },
    components: {},
} as const;

export type SetStrategySortOrderSchema = FromSchema<
    typeof setStrategySortOrderSchema
>;
