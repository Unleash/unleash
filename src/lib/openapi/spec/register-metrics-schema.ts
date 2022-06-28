import { FromSchema } from 'json-schema-to-ts';
import { dateSchema } from './date-schema';

export const registerMetricsSchema = {
    $id: '#/components/schemas/registerMetricsSchema',
    type: 'object',
    required: ['appName', 'bucket'],
    properties: {
        appName: { type: 'string' },
        instanceId: { type: 'string' },
        environment: { type: 'string' },
        bucket: {
            type: 'object',
            required: ['start', 'stop', 'toggles'],
            properties: {
                start: { $ref: '#/components/schemas/dateSchema' },
                stop: { $ref: '#/components/schemas/dateSchema' },
                toggles: {
                    type: 'object',
                    additionalProperties: {
                        type: 'object',
                        properties: {
                            yes: { type: 'integer', minimum: 0 },
                            no: { type: 'integer', minimum: 0 },
                            variants: {
                                type: 'object',
                                additionalProperties: {
                                    type: 'integer',
                                    minimum: 0,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            dateSchema,
        },
    },
} as const;

export type RegisterMetricsSchema = FromSchema<typeof registerMetricsSchema>;
