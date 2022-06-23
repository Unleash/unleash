import { FromSchema } from 'json-schema-to-ts';

export const versionSchema = {
    $id: '#/components/schemas/versionSchema',
    type: 'object',
    additionalProperties: false,
    required: ['current', 'latest', 'isLatest', 'instanceId'],
    properties: {
        current: {
            type: 'object',
            additionalProperties: false,
            properties: {
                oss: {
                    type: 'string',
                },
                enterprise: {
                    type: 'string',
                },
            },
        },
        latest: {
            type: 'object',
            additionalProperties: false,
            properties: {
                oss: {
                    type: 'string',
                },
                enterprise: {
                    type: 'string',
                },
            },
        },
        isLatest: {
            type: 'boolean',
        },
        instanceId: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type VersionSchema = FromSchema<typeof versionSchema>;
