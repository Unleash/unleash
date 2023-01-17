import { FromSchema } from 'json-schema-to-ts';
import { groupSchema } from './group-schema';
import { accountSchema } from './account-schema';
import { groupUserModelSchema } from './group-user-model-schema';

export const accessSchema = {
    $id: '#/components/schemas/accessSchema',
    type: 'object',
    additionalProperties: false,
    properties: {
        groups: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/groupSchema',
            },
        },
        accounts: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/accountSchema',
            },
        },
    },
    components: {
        schemas: {
            groupSchema,
            groupUserModelSchema,
            accountSchema,
        },
    },
} as const;

export type AccessSchema = FromSchema<typeof accessSchema>;
