import { FromSchema } from 'json-schema-to-ts';

export const environmentSchema = {
    $id: '#/components/schemas/environmentSchema',
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
        projectCount: {
            type: 'number',
            nullable: true,
        },
        apiTokenCount: {
            type: 'number',
            nullable: true,
        },
        enabledToggleCount: {
            type: 'number',
            nullable: true,
        },
    },
    components: {},
} as const;

export type EnvironmentSchema = FromSchema<typeof environmentSchema>;
