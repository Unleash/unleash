import { FromSchema } from 'json-schema-to-ts';
import { parametersSchema } from './parameters-schema';

export const clientAppSchema = {
    $id: '#/components/schemas/clientAppSchema',
    type: 'object',
    required: ['appName', 'instanceId'],
    properties: {
        appName: {
            type: 'string',
        },
        instanceId: {
            type: 'string',
        },
        clientIp: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        seenToggles: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        metricsCount: { type: 'number' },
        strategies: {
            type: 'array',
            items: {
                oneOf: [
                    { type: 'string' },
                    { $ref: '#/components/schemas/parametersSchema' },
                ],
            },
        },
        bucket: {
            additionalProperties: true,
        },
        count: {
            type: 'number',
        },
        interval: {
            type: 'number',
        },
        icon: { type: 'string' },
        description: { type: 'string' },
        color: { type: 'string' },
        started: {
            oneOf: [
                { type: 'string', format: 'date-time' },
                { type: 'number' },
            ],
        },
    },
    components: {
        schemas: {
            parametersSchema,
        },
    },
} as const;

export type ClientAppSchema = FromSchema<typeof clientAppSchema>;
