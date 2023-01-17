import { FromSchema } from 'json-schema-to-ts';
import { AccountTypes } from '../../types/account';

export const accountSchema = {
    $id: '#/components/schemas/accountSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id'],
    properties: {
        id: {
            type: 'number',
        },
        type: {
            type: 'string',
            enum: AccountTypes,
        },
        name: {
            type: 'string',
        },
        email: {
            type: 'string',
        },
        username: {
            type: 'string',
        },
        imageUrl: {
            type: 'string',
        },
        rootRole: {
            type: 'number',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
    },
    components: {},
} as const;

export type AccountSchema = FromSchema<typeof accountSchema>;
