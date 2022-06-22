import { FromSchema } from 'json-schema-to-ts';
import { roleDescriptionSchema } from './role-description-schema';

export const tokenUserSchema = {
    $id: '#/components/schemas/tokenUserSchema',
    type: 'object',
    additionalProperties: false,
    required: ['createdBy', 'token', 'role'],
    properties: {
        createdBy: {
            type: 'string',
        },
        token: {
            type: 'string',
        },
        role: {
            $ref: '#/components/schemas/roleDescriptionSchema',
        },
    },
    components: {
        schemas: {
            roleDescriptionSchema,
        },
    },
} as const;

export type TokenUserSchema = FromSchema<typeof tokenUserSchema>;
