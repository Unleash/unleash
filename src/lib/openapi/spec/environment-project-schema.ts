import { FromSchema } from 'json-schema-to-ts';

export const environmentProjectSchema = {
    $id: '#/components/schemas/environmentProjectSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'type', 'enabled'],
    properties: {
        name: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        protected: {
            type: 'boolean',
        },
        sortOrder: {
            type: 'number',
        },
        projectApiTokenCount: {
            type: 'number',
            nullable: true,
        },
        projectEnabledToggleCount: {
            type: 'number',
            nullable: true,
        },
    },
    components: {},
} as const;

export type EnvironmentProjectSchema = FromSchema<
    typeof environmentProjectSchema
>;
