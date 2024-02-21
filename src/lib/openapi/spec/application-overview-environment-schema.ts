import { FromSchema } from 'json-schema-to-ts';

export const applicationOverviewEnvironmentSchema = {
    $id: '#/components/schemas/applicationOverviewEnvironmentSchema',
    type: 'object',
    description: 'Data about an application environment',
    additionalProperties: false,
    required: ['name', 'instanceCount', 'sdks', 'lastSeen'],
    properties: {
        name: {
            description: 'Name of the application environment',
            type: 'string',
            example: 'production',
        },
        instanceCount: {
            description:
                'The number of instances of the application environment',
            type: 'number',
            example: 5,
        },
        sdks: {
            description: 'SDKs used in the application environment',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['unleash-client-node:5.4.0', 'unleash-client-node:5.3.0'],
        },
        lastSeen: {
            type: 'string',
            format: 'date-time',
            example: '2023-04-19T08:15:14.000Z',
            description: 'The last time the application environment was seen',
        },
    },
    components: {},
} as const;

export type ApplicationOverviewEnvironmentSchema = FromSchema<
    typeof applicationOverviewEnvironmentSchema
>;
