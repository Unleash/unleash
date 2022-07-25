import { FromSchema } from 'json-schema-to-ts';

export const setStrategySortOrderSchema = {
    $id: '#/components/schemas/setStrategySortOrderSchema',
    type: 'array',
    items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'sortOrder'],
        properties: {
            id: {
                type: 'string',
            },
            sortOrder: {
                type: 'number',
            },
        },
    },
    components: {},
} as const;

export type SetStrategySortOrderSchema = FromSchema<
    typeof setStrategySortOrderSchema
>;
