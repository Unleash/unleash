import { FromSchema } from 'json-schema-to-ts';
import { AccountTypes } from '../../types';

export const userSchema = {
    $id: '#/components/schemas/userSchema',
    type: 'object',
    additionalProperties: false,
    required: ['id'],
    properties: {
        id: {
            type: 'number',
        },
        isAPI: {
            type: 'boolean',
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
        inviteLink: {
            type: 'string',
        },
        loginAttempts: {
            type: 'number',
        },
        emailSent: {
            type: 'boolean',
        },
        rootRole: {
            type: 'number',
        },
        seenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
        },
        accountType: {
            type: 'string',
            enum: AccountTypes,
        },
    },
    components: {},
} as const;

export type UserSchema = FromSchema<typeof userSchema>;
