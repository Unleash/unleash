import { FromSchema } from 'json-schema-to-ts';

export const dateSchema = {
    $id: '#/components/schemas/dateSchema',
    oneOf: [{ type: 'string', format: 'date-time' }, { type: 'number' }],
    components: {},
} as const;

export type DateSchema = FromSchema<typeof dateSchema>;
