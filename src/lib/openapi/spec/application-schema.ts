import { FromSchema } from 'json-schema-to-ts';

export const applicationSchema = {
    $id: '#/components/schemas/applicationSchema',
    type: 'object',
    additionalProperties: false,
    required: ['appName'],
    properties: {
        appName: {
            type: 'string',
        },
        sdkVersion: {
            type: 'string',
        },
        strategies: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        description: {
            type: 'string',
        },
        url: {
            type: 'string',
        },
        color: {
            type: 'string',
        },
        icon: {
            type: 'string',
        },
        announced: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type ApplicationSchema = FromSchema<typeof applicationSchema>;
