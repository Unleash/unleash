import { FromSchema } from 'json-schema-to-ts';
import { ApiTokenType } from '../../types/models/api-token';

export const edgeTokenSchema = {
    $id: '#/components/schemas/edgeTokenSchema',
    type: 'object',
    additionalProperties: false,
    required: ['token', 'projects', 'type'],
    properties: {
        projects: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        type: {
            type: 'string',
            enum: Object.values(ApiTokenType),
        },
        token: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type EdgeTokenSchema = FromSchema<typeof edgeTokenSchema>;
