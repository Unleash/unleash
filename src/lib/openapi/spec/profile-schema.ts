import type { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { roleSchema } from './role-schema';

export const profileSchema = {
    $id: '#/components/schemas/profileSchema',
    type: 'object',
    additionalProperties: false,
    description: 'User profile overview',
    required: ['rootRole', 'projects', 'features'],
    properties: {
        rootRole: {
            $ref: '#/components/schemas/roleSchema',
        },
        projects: {
            description: 'Which projects this user is a member of',
            type: 'array',
            items: {
                type: 'string',
            },
            example: ['my-projectA', 'my-projectB'],
        },
        features: {
            description: 'Deprecated, always returns empty array',
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
            example: [],
        },
    },
    components: {
        schemas: {
            featureSchema,
            roleSchema,
        },
    },
} as const;

export type ProfileSchema = FromSchema<typeof profileSchema>;
