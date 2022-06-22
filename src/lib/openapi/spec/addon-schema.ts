import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';

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
            $ref: '#/components/schemas/parameterSchema',
        },
        events: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {
            parametersSchema,
        },
    },
} as const;

export type AddonSchema = FromSchema<typeof addonSchema>;
