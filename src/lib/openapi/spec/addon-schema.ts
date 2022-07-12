import { FromSchema } from 'json-schema-to-ts';

export const addonSchema = {
    $id: '#/components/schemas/addonSchema',
    type: 'object',
    required: ['provider', 'enabled', 'parameters', 'events'],
    properties: {
        id: {
            type: 'number',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        provider: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        parameters: {
            type: 'object',
            additionalProperties: true,
        },
        events: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        projects: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        environments: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {},
} as const;

export type AddonSchema = FromSchema<typeof addonSchema>;
