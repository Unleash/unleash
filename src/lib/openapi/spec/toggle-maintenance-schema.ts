import { FromSchema } from 'json-schema-to-ts';

export const toggleMaintenanceSchema = {
    $id: '#/components/schemas/toggleMaintenanceSchema',
    type: 'object',
    required: ['enabled'],
    properties: {
        enabled: {
            type: 'boolean',
            example: true,
        },
    },
    components: {},
} as const;

export type ToggleMaintenanceSchema = FromSchema<
    typeof toggleMaintenanceSchema
>;
