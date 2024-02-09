import { FromSchema } from 'json-schema-to-ts';

export const projectApplicationInstanceSchema = {
    $id: '#/components/schemas/projectApplicationInstanceSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id', 'sdkVersion'],
    description: 'A project application instance.',
    properties: {
        id: {
            type: 'string',
            description:
                'The unique identifier of the application instance. This is the same as the instanceId in the SDK configuration',
        },
        lastSeenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-01-28T15:21:39.975Z',
            description: 'The last time the instance was seen',
        },
        sdkVersion: {
            type: 'string',
            description:
                'The version of the SDK that is being used by the instance',
        },
    },
    components: {},
} as const;

export type ProjectApplicationInstanceSchema = FromSchema<
    typeof projectApplicationInstanceSchema
>;
