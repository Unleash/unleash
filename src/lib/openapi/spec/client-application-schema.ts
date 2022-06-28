import { FromSchema } from 'json-schema-to-ts';

export const clientApplicationSchema = {
    $id: '#/components/schemas/clientApplicationSchema',
    type: 'object',
    required: ['appName', 'interval', 'started', 'strategies'],
    properties: {
        appName: {
            type: 'string',
        },
        instanceId: {
            type: 'string',
        },
        sdkVersion: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        interval: {
            type: 'number',
        },
        started: {
            oneOf: [
                { type: 'string', format: 'date-time' },
                { type: 'number' },
            ],
        },
        strategies: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {},
} as const;

export type ClientApplicationSchema = FromSchema<
    typeof clientApplicationSchema
>;
