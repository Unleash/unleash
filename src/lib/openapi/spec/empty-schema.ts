import { FromSchema } from 'json-schema-to-ts';

export const emptySchema = {
    $id: '#/components/schemas/emptySchema',
    description: 'emptySchema',
    components: {},
} as const;

export type EmptySchema = FromSchema<typeof emptySchema>;
