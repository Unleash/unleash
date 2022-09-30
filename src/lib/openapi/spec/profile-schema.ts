import { FromSchema } from 'json-schema-to-ts';
import { featureSchema } from './feature-schema';
import { RoleName } from '../../types/model';

export const profileSchema = {
    $id: '#/components/schemas/profileSchema',
    type: 'object',
    additionalProperties: false,
    required: ['rootRole', 'projects', 'features'],
    properties: {
        rootRole: {
            type: 'string',
            enum: Object.values(RoleName),
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
        },
    },
} as const;

export type ProfileSchema = FromSchema<typeof profileSchema>;
