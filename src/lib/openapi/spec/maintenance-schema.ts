import { FromSchema } from 'json-schema-to-ts';

export const maintenanceSchema = {
    $id: '#/components/schemas/maintenanceSchema',
    type: 'object',
    additionalProperties: false,
    required: ['enabled'],
    properties: {
        enabled: {
            type: 'boolean',
            example: true,
        },
    },
    components: {},
} as const;

export type MaintenanceSchema = FromSchema<typeof maintenanceSchema>;
