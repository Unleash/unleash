import { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { roleSchema } from './role-schema';

export const profileSchema = {
    $id: '#/components/schemas/profileSchema',
    type: 'object',
    additionalProperties: false,
    required: ['rootRole', 'projects', 'features'],
    properties: {
        rootRole: {
            $ref: '#/components/schemas/roleSchema',
        },
        projects: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
        features: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/featureSchema',
            },
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
