import type { FromSchema } from 'json-schema-to-ts';

export const maintenanceSchema = {
    $id: '#/components/schemas/maintenanceSchema',
    type: 'object',
    additionalProperties: false,
    description: "The current state of Unleash's maintenance mode feature.",
    required: ['enabled'],
    properties: {
        enabled: {
            description: 'Whether maintenance mode is enabled or not.',
            type: 'boolean',
            example: true,
        },
    },
    components: {},
} as const;

export type MaintenanceSchema = FromSchema<typeof maintenanceSchema>;
