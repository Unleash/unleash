import { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema';

export const bulkRegistrationSchema = {
    $id: '#/components/schemas/bulkRegistrationSchema',
    type: 'object',
    required: ['appName', 'instanceId'],
    properties: {
        connectVia: {
            type: 'array',
            items: {
                type: 'object',
                required: ['appName', 'instanceId'],
                properties: {
                    appName: {
                        type: 'string',
                    },
                    instanceId: {
                        type: 'string',
                    },
                },
            },
        },
        appName: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        instanceId: {
            type: 'string',
        },
        interval: {
            type: 'number',
        },
        started: {
            $ref: '#/components/schemas/dateSchema',
        },
        strategies: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        sdkVersion: {
            type: 'string',
        },
    },
    components: {
        schemas: {
            dateSchema,
        },
    },
} as const;

export type BulkRegistrationSchema = FromSchema<typeof bulkRegistrationSchema>;
