import { FromSchema } from 'json-schema-to-ts';

export const instanceAdminStatsSchema = {
    $id: '#/components/schemas/instanceAdminStatsSchema',
    type: 'object',
    additionalProperties: false,
    required: ['instanceId'],
    properties: {
        instanceId: {
            type: 'string',
        },
        timestamp: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        versionOSS: {
            type: 'string',
        },
        versionEnterprise: {
            type: 'string',
        },
        users: {
            type: 'number',
        },
        featureToggles: {
            type: 'number',
        },
        projects: {
            type: 'number',
        },
        contextFields: {
            type: 'number',
        },
        roles: {
            type: 'number',
        },
        groups: {
            type: 'number',
        },
        environments: {
            type: 'number',
        },
        segments: {
            type: 'number',
        },
        strategies: {
            type: 'number',
        },
        SAMLenabled: {
            type: 'number',
        },
        OIDCenabled: {
            type: 'number',
        },
        sum: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type InstanceAdminStatsSchema = FromSchema<
    typeof instanceAdminStatsSchema
>;
