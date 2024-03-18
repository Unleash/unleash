import type { FromSchema } from 'json-schema-to-ts';

export const toggleMaintenanceSchema = {
    $id: '#/components/schemas/toggleMaintenanceSchema',
    type: 'object',
    description:
        'Data used when to activate or deactivate maintenance mode for Unleash.',
    required: ['enabled'],
    properties: {
        enabled: {
            description:
                '`true` if you want to activate maintenance mode, `false` if you want to deactivate it.',
            type: 'boolean',
            example: true,
        },
    },
    components: {},
} as const;

export type ToggleMaintenanceSchema = FromSchema<
    typeof toggleMaintenanceSchema
>;
